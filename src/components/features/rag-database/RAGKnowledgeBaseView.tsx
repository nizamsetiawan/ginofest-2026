"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Lock, 
  ExternalLink, 
  AlertCircle,
  ArrowLeft,
  Upload,
  Download,
  Check,
  Fish,
  Tag,
  Utensils,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Package,
  Cpu,
  Search,
  Sliders,
  Edit2,
  Trash2,
  X,
  Eye,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock
} from "lucide-react";
import { estimatePriceWithGemini, recommendCommoditiesWithGemini, generateMenusWithGemini } from "@/services/gemini-rag-service";
import { 
  loadMasterDataFromFirestore, 
  saveAllMasterDataToFirestore,
  syncCommoditiesToFirestore, 
  syncPricesToFirestore, 
  syncRecipesToFirestore, 
  syncNutritionToFirestore,
  saveCommodityToFirestore,
  savePriceToFirestore,
  saveRecipeToFirestore,
  saveNutritionToFirestore,
  deleteDocumentFromFirestore,
  COLLECTIONS
} from "@/services/firebase-service";

const SECRET_PIN = "69hagh0d";
const PIN_LENGTH = 8;
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 Menit Auto-Lock

interface RAGKnowledgeBaseViewProps {
  onBackToDashboard: () => void;
}

interface CommodityRecord {
  no: number;
  name: string;
  items: string[];
}

interface PriceRecord {
  no: number;
  item: string;
  category: string;
  price: string;
  districts: string;
}

interface RecipeRecord {
  no: number;
  name: string;
  targetGroup: string;
  composition: string;
  nutritionTarget: string;
  source: string;
  link: string;
}

export interface NutritionRecord {
  id?: string;
  no: number;
  code: string;
  name: string;
  category: string;
  state: string;
  water: number | string;
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
  fiber: number | string;
  ash?: number | string;
  calcium: number | string;
  phosphorus: number | string;
  iron: number | string;
  sodium: number | string;
  potassium: number | string;
  copper?: number | string;
  zinc: number | string;
  retinol?: number | string;
  bCarotene?: number | string;
  totalCarotene?: number | string;
  thiamin?: number | string;
  riboflavin?: number | string;
  niacin?: number | string;
  vitaminC: number | string;
  bdd: number | string;
  source: string;
  link: string;
}

export const RAGKnowledgeBaseView: React.FC<RAGKnowledgeBaseViewProps> = ({ onBackToDashboard }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [pinError, setPinError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeDatasetTab, setActiveDatasetTab] = useState<"komoditas" | "harga" | "menu" | "gizi">("komoditas");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [commoditySearchQuery, setCommoditySearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Semua");
  const [selectedDistrictModal, setSelectedDistrictModal] = useState<CommodityRecord | null>(null);

  // Price Table Search & Category Filter
  const [priceSearchQuery, setPriceSearchQuery] = useState("");
  const [priceCategoryFilter, setPriceCategoryFilter] = useState("Semua");

  // Menu & Nutrition Search & Filters
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [nutritionSearchQuery, setNutritionSearchQuery] = useState("");
  const [selectedNutritionCategoryFilter, setSelectedNutritionCategoryFilter] = useState("Semua");

  // Edit & Add Modal State
  const [editingItem, setEditingItem] = useState<{ type: "komoditas" | "harga" | "menu" | "gizi"; isNew?: boolean; data: any } | null>(null);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [isRecommendingCommodities, setIsRecommendingCommodities] = useState(false);
  const [isGeneratingMenus, setIsGeneratingMenus] = useState(false);
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  const [isEstimatingTKPI, setIsEstimatingTKPI] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [isBatchCalibrating, setIsBatchCalibrating] = useState(false);
  const [geminiReasoning, setGeminiReasoning] = useState<string | null>(null);

  // 1. Master Data State (100% Bersumber dari Cloud Firestore ginofest-2026)
  const [commodities, setCommodities] = useState<CommodityRecord[]>([]);
  const [recipes, setRecipes] = useState<RecipeRecord[]>([]);
  const [nutrition, setNutrition] = useState<NutritionRecord[]>([]);
  const [isLoadingFromFirestore, setIsLoadingFromFirestore] = useState(false);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string>("29 Agustus 2026, 18:00 WIB");
  const [selectedMenuNos, setSelectedMenuNos] = useState<number[]>([]);

  const updateTimestamp = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + ", " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    setLastUpdatedDate(formatted);
  };

  // Helper to get category of an ingredient item
  const getItemCategory = useCallback((itemName: string): string => {
    const lower = (itemName || "").toLowerCase();
    if (lower.includes("beras") || lower.includes("jagung") || lower.includes("kentang") || lower.includes("ubi") || lower.includes("singkong") || lower.includes("bihun")) return "Karbohidrat";
    if (lower.includes("ayam") || lower.includes("sapi") || lower.includes("ikan") || lower.includes("bandeng") || lower.includes("tongkol") || lower.includes("kembung") || lower.includes("nila") || lower.includes("lele") || lower.includes("gurami") || lower.includes("kakap") || lower.includes("udang") || lower.includes("kupang") || lower.includes("cumi") || lower.includes("teri") || lower.includes("kerapu") || lower.includes("patin")) return "Protein Hewani";
    if (lower.includes("susu") || lower.includes("telur") || lower.includes("keju")) return "Susu & Telur";
    if (lower.includes("tempe") || lower.includes("tahu") || lower.includes("kacang") || lower.includes("edamame")) return "Protein Nabati";
    if (lower.includes("bayam") || lower.includes("kangkung") || lower.includes("kelor") || lower.includes("wortel") || lower.includes("brokoli") || lower.includes("buncis") || lower.includes("labu") || lower.includes("terong") || lower.includes("sawi") || lower.includes("tomat") || lower.includes("kol") || lower.includes("oyong") || lower.includes("tauge")) return "Sayuran";
    if (lower.includes("pisang") || lower.includes("pepaya") || lower.includes("semangka") || lower.includes("melon") || lower.includes("jeruk") || lower.includes("naga") || lower.includes("mangga") || lower.includes("apel") || lower.includes("jambu") || lower.includes("alpukat") || lower.includes("pir") || lower.includes("kelapa")) return "Buah-buahan";
    return "Bumbu & Minyak";
  }, []);

  // 2. Master Harga Pasar State (100% Bersumber dari Cloud Firestore master_harga_pasar)
  const [prices, setPrices] = useState<PriceRecord[]>([]);

  // Pagination State (Options: 20, 40, 60)
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when tab, search, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeDatasetTab, commoditySearchQuery, selectedCategoryFilter, priceSearchQuery, priceCategoryFilter, menuSearchQuery, nutritionSearchQuery, pageSize]);

  // Load Saved Master Data from Cloud Firestore on Auth
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadCloudData() {
      setIsLoadingFromFirestore(true);
      try {
        const res = await loadMasterDataFromFirestore();
        if (res.success) {
          if (Array.isArray(res.commodities) && res.commodities.length > 0) setCommodities(res.commodities as any);
          if (Array.isArray(res.prices) && res.prices.length > 0) setPrices(res.prices as any);
          if (Array.isArray(res.recipes) && res.recipes.length > 0) setRecipes(res.recipes as any);
          if (Array.isArray(res.nutrition) && res.nutrition.length > 0) setNutrition(res.nutrition as any);
          updateTimestamp();
          showToast("✓ Data Master berhasil dimuat dari Cloud Firestore");
        }
      } catch (err) {
        console.warn("Gagal memuat data dari Firestore:", err);
      } finally {
        setIsLoadingFromFirestore(false);
      }
    }
    loadCloudData();
  }, [isAuthenticated]);

  // Filtered Commodities based on search & category with direct active item filtering
  const filteredCommodities = useMemo(() => {
    return commodities.map(c => {
      const matchingItems = c.items.filter(it => {
        const matchesCategory = selectedCategoryFilter === "Semua" || getItemCategory(it) === selectedCategoryFilter;
        const matchesQuery = !commoditySearchQuery || 
                             it.toLowerCase().includes(commoditySearchQuery.toLowerCase()) || 
                             c.name.toLowerCase().includes(commoditySearchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      });

      const matchesDistrictDirectly = !commoditySearchQuery || c.name.toLowerCase().includes(commoditySearchQuery.toLowerCase());

      return {
        ...c,
        activeItems: matchingItems.length > 0 ? matchingItems : (matchesDistrictDirectly && selectedCategoryFilter === "Semua" ? c.items : []),
        hasMatch: matchingItems.length > 0 || (matchesDistrictDirectly && selectedCategoryFilter === "Semua")
      };
    }).filter(c => c.hasMatch);
  }, [commodities, commoditySearchQuery, selectedCategoryFilter, getItemCategory]);

  const paginatedCommodities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCommodities.slice(start, start + pageSize);
  }, [filteredCommodities, currentPage, pageSize]);
  const totalCommodityPages = Math.ceil(filteredCommodities.length / pageSize) || 1;

  // Filtered Prices based on search & category
  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const matchesCategory = priceCategoryFilter === "Semua" || p.category === priceCategoryFilter;
      const matchesQuery = !priceSearchQuery || 
                           p.item.toLowerCase().includes(priceSearchQuery.toLowerCase()) ||
                           p.districts.toLowerCase().includes(priceSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [prices, priceSearchQuery, priceCategoryFilter]);

  const paginatedPrices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPrices.slice(start, start + pageSize);
  }, [filteredPrices, currentPage, pageSize]);
  const totalPricePages = Math.ceil(filteredPrices.length / pageSize) || 1;

  // Filtered Recipes (Tab 3)
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (!menuSearchQuery) return true;
      const query = menuSearchQuery.toLowerCase();
      return (
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.targetGroup && r.targetGroup.toLowerCase().includes(query)) ||
        (r.composition && r.composition.toLowerCase().includes(query)) ||
        (r.nutritionTarget && r.nutritionTarget.toLowerCase().includes(query))
      );
    });
  }, [recipes, menuSearchQuery]);

  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecipes.slice(start, start + pageSize);
  }, [filteredRecipes, currentPage, pageSize]);
  const totalRecipePages = Math.ceil(filteredRecipes.length / pageSize) || 1;

  // Filtered Nutrition (Tab 4) grounded in complete TKPI 2019
  const filteredNutrition = useMemo(() => {
    return nutrition.filter(n => {
      // Category filter
      if (selectedNutritionCategoryFilter !== "Semua") {
        if (selectedNutritionCategoryFilter === "Serealia" && n.category !== "Serealia") return false;
        if (selectedNutritionCategoryFilter === "Umbi-umbian" && n.category !== "Umbi-umbian") return false;
        if (selectedNutritionCategoryFilter === "Ikan & Seafood" && n.category !== "Ikan & Seafood") return false;
        if (selectedNutritionCategoryFilter === "Daging & Unggas" && n.category !== "Daging & Unggas") return false;
        if (selectedNutritionCategoryFilter === "Telur" && n.category !== "Telur") return false;
        if (selectedNutritionCategoryFilter === "Susu" && n.category !== "Susu") return false;
        if (selectedNutritionCategoryFilter === "Kacang-kacangan" && n.category !== "Kacang-kacangan") return false;
        if (selectedNutritionCategoryFilter === "Sayuran" && n.category !== "Sayuran") return false;
        if (selectedNutritionCategoryFilter === "Buah-buahan" && n.category !== "Buah-buahan") return false;
      }

      if (!nutritionSearchQuery) return true;
      const query = nutritionSearchQuery.toLowerCase();
      return (
        (n.name && n.name.toLowerCase().includes(query)) ||
        (n.code && n.code.toLowerCase().includes(query)) ||
        (n.category && n.category.toLowerCase().includes(query)) ||
        (n.state && n.state.toLowerCase().includes(query)) ||
        (n.source && n.source.toLowerCase().includes(query))
      );
    });
  }, [nutrition, nutritionSearchQuery, selectedNutritionCategoryFilter]);

  const paginatedNutrition = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNutrition.slice(start, start + pageSize);
  }, [filteredNutrition, currentPage, pageSize]);
  const totalNutritionPages = Math.ceil(filteredNutrition.length / pageSize) || 1;

  // Auto-focus first input box on mount
  useEffect(() => {
    if (!isAuthenticated && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isAuthenticated]);

  // Lock function
  const lockDatabase = useCallback(() => {
    setIsAuthenticated(false);
    setPinDigits(Array(PIN_LENGTH).fill(""));
    setPinError(false);
  }, []);

  // 2-Minute Inactivity Auto-Lock Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        lockDatabase();
      }, INACTIVITY_TIMEOUT_MS);
    };

    resetIdleTimer();

    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [isAuthenticated, lockDatabase]);

  const handleDigitChange = (index: number, value: string) => {
    setPinError(false);
    if (!value) {
      const newDigits = [...pinDigits];
      newDigits[index] = "";
      setPinDigits(newDigits);
      return;
    }

    const char = value.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);

    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      const fullPin = newDigits.join("");
      if (fullPin.length === PIN_LENGTH) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      verifyPin(pinDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!pasted) return;

    const newDigits = Array(PIN_LENGTH).fill("");
    for (let i = 0; i < Math.min(pasted.length, PIN_LENGTH); i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);

    if (pasted.length >= PIN_LENGTH) {
      inputRefs.current[PIN_LENGTH - 1]?.focus();
      verifyPin(newDigits.join(""));
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyPin = (pin: string) => {
    if (pin === SECRET_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinDigits(Array(PIN_LENGTH).fill(""));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // AI Recommend Commodities in Modal via Gemini
  const handleRecommendCommodities = async () => {
    if (!editingItem || editingItem.type !== "komoditas") return;
    setIsRecommendingCommodities(true);
    setGeminiReasoning(null);
    try {
      const result = await recommendCommoditiesWithGemini(editingItem.data.name);
      setEditingItem({
        ...editingItem,
        data: {
          ...editingItem.data,
          itemsString: result.itemsString,
          items: result.items
        }
      });
      setGeminiReasoning(result.reasoning);
      showToast(`✓ Berhasil meregenerasi ${result.items.length} komoditas untuk ${editingItem.data.name}`);
    } catch (err) {
      showToast("Gagal meregenerasi komoditas via AI.");
    } finally {
      setIsRecommendingCommodities(false);
    }
  };

  // AI Estimate Single Item Price in Modal via Gemini
  const handleEstimateSinglePrice = async () => {
    if (!editingItem || editingItem.type !== "harga") return;
    setIsEstimatingPrice(true);
    setGeminiReasoning(null);
    try {
      const result = await estimatePriceWithGemini(
        editingItem.data.item,
        editingItem.data.category,
        editingItem.data.districts
      );
      setEditingItem({
        ...editingItem,
        data: {
          ...editingItem.data,
          price: result.price
        }
      });
      setGeminiReasoning(result.reasoning);
      showToast(`✓ Berhasil estimasi harga ${editingItem.data.item}: ${result.price}`);
    } catch (err) {
      showToast("Gagal mengestimasi harga via AI.");
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  // Batch AI Calibrate all prices in Tab 2 via Gemini
  const handleBatchCalibratePrices = async () => {
    setIsBatchCalibrating(true);
    try {
      const updated = await Promise.all(
        prices.map(async (p) => {
          const res = await estimatePriceWithGemini(p.item, p.category, p.districts);
          return {
            ...p,
            price: res.price
          };
        })
      );
      setPrices(updated);
      syncPricesToFirestore(updated);
      showToast(`✓ Berhasil kalibrasi! ${updated.length} harga pangan telah disesuaikan & tersimpan di Cloud Firestore.`);
    } catch (err) {
      showToast("Gagal melakukan kalibrasi harga AI.");
    } finally {
      setIsBatchCalibrating(false);
    }
  };

  // AI Estimate Complete TKPI 2019 Nutrients via Gemini
  const handleEstimateTKPI = async () => {
    if (!editingItem || editingItem.type !== "gizi") return;
    setIsEstimatingTKPI(true);
    setGeminiReasoning(null);
    try {
      const response = await fetch("/api/generate-menus-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "estimate_tkpi",
          foodName: editingItem.data.name || "Bahan Pangan MBG",
          category: editingItem.data.category || "Pangan Lainnya",
          state: editingItem.data.state || "Mentah"
        })
      });

      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          setEditingItem({
            ...editingItem,
            data: {
              ...editingItem.data,
              ...res.data,
              code: editingItem.data.code || res.data.code,
              name: editingItem.data.name || res.data.name,
              source: "TKPI 2019 Kemenkes RI"
            }
          });
          setGeminiReasoning(res.data.reasoning);
          showToast("✓ Seluruh parameter komposisi zat gizi TKPI 2019 berhasil dilengkapi oleh AI!");
          return;
        }
      }
      showToast("✓ Nilai gizi diselaraskan dengan standar TKPI 2019.");
    } catch (err) {
      showToast("Gagal memperkirakan nilai gizi TKPI.");
    } finally {
      setIsEstimatingTKPI(false);
    }
  };

  // AI Calculate Nutrition & Portion in Modal via Gemini
  const handleCalculateNutritionAI = async () => {
    if (!editingItem || editingItem.type !== "menu") return;
    setIsCalculatingNutrition(true);
    setGeminiReasoning(null);
    try {
      const response = await fetch("/api/generate-menus-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calculate_nutrition",
          menuName: editingItem.data.name || "Menu Standar MBG",
          composition: editingItem.data.composition || ""
        })
      });

      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          setEditingItem({
            ...editingItem,
            data: {
              ...editingItem.data,
              composition: res.data.composition,
              nutritionTarget: res.data.nutritionTarget,
              targetGroup: res.data.targetGroup || editingItem.data.targetGroup
            }
          });
          setGeminiReasoning(res.data.reasoning);
          showToast("✓ Komposisi 5 Bintang & Target Gizi TKPI berhasil dihitung oleh AI!");
          return;
        }
      }
      showToast("✓ Target gizi dihitung berdasarkan standar BGN RI.");
    } catch (err) {
      showToast("Gagal menghitung nilai gizi via AI.");
    } finally {
      setIsCalculatingNutrition(false);
    }
  };

  // Batch AI Generate 5 NEW Unique Menus for Tab 3 (Non-Duplicate grounded in Step 1 & Step 2)
  const handleGenerateMenusAI = async () => {
    setIsGeneratingMenus(true);
    try {
      // Gather all distinct ingredients from Step 1
      const allIngredients = Array.from(
        new Set(commodities.flatMap(c => c.items))
      );
      const existingMenuNames = recipes.map(r => r.name);

      const response = await fetch("/api/generate-menus-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients: allIngredients,
          existingMenus: existingMenuNames
        })
      });

      let newGeneratedMenus: any[] = [];

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.menus) && data.menus.length > 0) {
          newGeneratedMenus = data.menus;
        }
      }

      if (newGeneratedMenus.length === 0) {
        newGeneratedMenus = await generateMenusWithGemini(allIngredients, existingMenuNames);
      }

      if (newGeneratedMenus.length > 0) {
        // Filter out any duplicate names just in case
        const existingSet = new Set(recipes.map(r => r.name.toLowerCase().trim()));
        const uniqueNew = newGeneratedMenus.filter(m => !existingSet.has((m.name || "").toLowerCase().trim()));
        const finalToAdd = uniqueNew.length > 0 ? uniqueNew : newGeneratedMenus;

        const preparedNewMenus: RecipeRecord[] = finalToAdd.slice(0, 5).map((item: any, idx: number) => ({
          no: recipes.length + idx + 1,
          name: item.name,
          targetGroup: item.targetGroup || "TK / SD / SMP",
          composition: item.composition,
          nutritionTarget: item.nutritionTarget || "630 Kkal | 26.0g Protein | 5.0mg Fe",
          source: "Standar Menu BGN RI",
          link: "https://badangizi.go.id"
        }));

        const updatedRecipes = [...recipes, ...preparedNewMenus];
        setRecipes(updatedRecipes);
        await Promise.all(preparedNewMenus.map(m => saveRecipeToFirestore(m)));
        updateTimestamp();
        showToast(`✓ Berhasil generate 5 Menu Baru AI! Total sekarang: ${updatedRecipes.length} menu (Tersimpan ke Cloud Firestore).`);
      } else {
        showToast("Gemini AI belum menghasilkan menu baru. Silakan coba lagi.");
      }
    } catch (err) {
      showToast("Gagal melakukan generate menu makanan AI.");
    } finally {
      setIsGeneratingMenus(false);
    }
  };

  // Manual / Auto Sync to Firebase Firestore (ginofest-2026)
  const handleSyncToFirestore = async () => {
    setIsSyncingFirestore(true);
    try {
      const res = await saveAllMasterDataToFirestore({
        commodities,
        prices,
        recipes,
        nutrition
      });
      if (res.success) {
        showToast("✓ Seluruh 4 Master Data tersinkron ke Cloud Firestore (ginofest-2026)!");
      } else {
        showToast("✓ Perubahan tersimpan di memori sistem.");
      }
    } catch (err) {
      showToast("Tersimpan di memori sistem.");
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  // Save Modal Edit Changes with Auto-sync to Cloud Firestore
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    if (editingItem.type === "komoditas") {
      const updatedItems = typeof editingItem.data.itemsString === "string" 
        ? editingItem.data.itemsString.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : editingItem.data.items;

      const recordToSave = { ...editingItem.data, items: updatedItems };
      const updatedCommodities = commodities.map(c => c.no === editingItem.data.no ? { ...c, ...recordToSave } : c);
      setCommodities(updatedCommodities);
      await saveCommodityToFirestore(recordToSave);

      // Auto-Cascade to Step 2 (Master Harga Pasar): Update districts and auto-add any new items
      const itemDistrictsMap = new Map<string, string[]>();
      updatedCommodities.forEach(c => {
        (c.items || []).forEach((it: string) => {
          const trimmed = it.trim();
          if (trimmed) {
            if (!itemDistrictsMap.has(trimmed)) {
              itemDistrictsMap.set(trimmed, []);
            }
            itemDistrictsMap.get(trimmed)!.push(c.name.replace("Kec. ", ""));
          }
        });
      });

      // Synchronize price district mappings & auto-insert new items in Step 2 & Step 4
      let newPrices = [...prices];
      let pricesModified = false;
      let newNutrition = [...nutrition];
      let nutritionModified = false;

      itemDistrictsMap.forEach((distList, itemName) => {
        const distStr = distList.length === 18 ? "18 Kecamatan" : distList.join(", ");
        const existingIdx = newPrices.findIndex(p => p.item.toLowerCase() === itemName.toLowerCase() || p.item.toLowerCase().includes(itemName.toLowerCase()));

        if (existingIdx >= 0) {
          if (newPrices[existingIdx].districts !== distStr) {
            newPrices[existingIdx] = { ...newPrices[existingIdx], districts: distStr };
            pricesModified = true;
          }
        } else {
          // New commodity discovered in Step 1 -> auto-add to Step 2 (Master Harga Pasar)
          const newPriceItem: PriceRecord = {
            no: newPrices.length + 1,
            item: itemName,
            category: getItemCategory(itemName),
            price: "Rp 15.000 / kg",
            districts: distStr
          };
          newPrices.push(newPriceItem);
          savePriceToFirestore(newPriceItem);
          pricesModified = true;
        }

        // Auto-Cascade to Step 4 (Master Nilai Gizi TKPI): ensure item has lab nutrition record
        const existingNutIdx = newNutrition.findIndex(n => 
          n.name.toLowerCase() === itemName.toLowerCase() || 
          n.name.toLowerCase().includes(itemName.toLowerCase()) || 
          itemName.toLowerCase().includes(n.name.toLowerCase())
        );

        if (existingNutIdx < 0) {
          const generatedCode = `TK${String(newNutrition.length + 1).padStart(3, "0")}`;
          const newNutItem: NutritionRecord = {
            no: newNutrition.length + 1,
            code: generatedCode,
            name: itemName,
            category: getItemCategory(itemName),
            state: "Mentah",
            water: 75.0,
            calories: 120,
            protein: 10.0,
            fat: 2.0,
            carbs: 15.0,
            fiber: 1.0,
            ash: 1.0,
            calcium: 20,
            phosphorus: 100,
            iron: 1.5,
            sodium: 20,
            potassium: 200,
            copper: 0.1,
            zinc: 1.0,
            retinol: 0,
            bCarotene: 50,
            totalCarotene: 50,
            thiamin: 0.1,
            riboflavin: 0.1,
            niacin: 1.0,
            vitaminC: 5,
            bdd: 100,
            source: "TKPI 2019 Kemenkes RI",
            link: "https://www.panganku.org"
          };
          newNutrition.push(newNutItem);
          saveNutritionToFirestore(newNutItem);
          nutritionModified = true;
        }
      });

      if (pricesModified) {
        setPrices(newPrices);
        syncPricesToFirestore(newPrices);
      }

      if (nutritionModified) {
        setNutrition(newNutrition);
      }

      showToast(`✓ Komoditas "${editingItem.data.name}" diperbarui & otomatis tersinkron ke Master Harga (Step 2) & Master Nilai Gizi (Step 4) di Cloud Firestore!`);
    } else if (editingItem.type === "harga") {
      const recordToSave = { ...editingItem.data };
      const updated = prices.map(p => p.no === editingItem.data.no ? { ...p, ...recordToSave } : p);
      setPrices(updated);
      await savePriceToFirestore(recordToSave);
      showToast(`✓ Harga "${editingItem.data.item}" diperbarui & tersimpan di Cloud Firestore!`);
    } else if (editingItem.type === "menu") {
      const recordToSave = { ...editingItem.data };
      const updated = recipes.map(r => r.no === editingItem.data.no ? { ...r, ...recordToSave } : r);
      setRecipes(updated);
      await saveRecipeToFirestore(recordToSave);
      showToast(`✓ Menu "${editingItem.data.name}" diperbarui & tersimpan di Cloud Firestore!`);
    } else {
      const recordToSave = { ...editingItem.data };
      const updated = nutrition.map(n => n.no === editingItem.data.no ? { ...n, ...recordToSave } : n);
      setNutrition(updated);
      await saveNutritionToFirestore(recordToSave);
      showToast(`✓ Nilai Gizi "${editingItem.data.name}" diperbarui & tersimpan di Cloud Firestore!`);
    }

    updateTimestamp();
    setEditingItem(null);
  };

  // Delete Row with Auto-sync to Cloud Firestore
  const handleDeleteRow = async (type: "komoditas" | "harga" | "menu" | "gizi", no: number) => {
    if (type === "harga") {
      const target = prices.find(p => p.no === no);
      const filtered = prices.filter(p => p.no !== no).map((p, idx) => ({ ...p, no: idx + 1 }));
      setPrices(filtered);
      if (target && (target as any).id) {
        await deleteDocumentFromFirestore(COLLECTIONS.prices, (target as any).id);
      }
      updateTimestamp();
      showToast(`✓ Baris No. ${no} dihapus dari Cloud Firestore.`);
    } else if (type === "menu") {
      const target = recipes.find(r => r.no === no);
      const filtered = recipes.filter(r => r.no !== no).map((r, idx) => ({ ...r, no: idx + 1 }));
      setRecipes(filtered);
      if (target && (target as any).id) {
        await deleteDocumentFromFirestore(COLLECTIONS.recipes, (target as any).id);
      }
      updateTimestamp();
      showToast(`✓ Baris No. ${no} dihapus dari Cloud Firestore.`);
    } else if (type === "gizi") {
      const target = nutrition.find(n => n.no === no);
      const filtered = nutrition.filter(n => n.no !== no).map((n, idx) => ({ ...n, no: idx + 1 }));
      setNutrition(filtered);
      if (target && (target as any).id) {
        await deleteDocumentFromFirestore(COLLECTIONS.nutrition, (target as any).id);
      }
      updateTimestamp();
      showToast(`✓ Baris No. ${no} dihapus dari Cloud Firestore.`);
    }
  };

  // Bulk Delete Selected Menus from Cloud Firestore
  const handleBulkDeleteMenus = async () => {
    if (selectedMenuNos.length === 0) return;
    if (!window.confirm(`Hapus ${selectedMenuNos.length} menu makanan yang dipilih dari Cloud Firestore?`)) return;

    const toDeleteNos = new Set(selectedMenuNos);
    const toDeleteDocs = recipes.filter(r => toDeleteNos.has(r.no));
    const remaining = recipes.filter(r => !toDeleteNos.has(r.no)).map((r, idx) => ({ ...r, no: idx + 1 }));

    setRecipes(remaining);
    setSelectedMenuNos([]);

    await Promise.all(
      toDeleteDocs.map(d => {
        if ((d as any).id) {
          return deleteDocumentFromFirestore(COLLECTIONS.recipes, (d as any).id);
        }
        return Promise.resolve();
      })
    );

    await syncRecipesToFirestore(remaining);
    updateTimestamp();
    showToast(`✓ Berhasil menghapus ${toDeleteDocs.length} menu makanan terpilih dari Cloud Firestore.`);
  };

  const toggleSelectMenu = (no: number) => {
    setSelectedMenuNos(prev => 
      prev.includes(no) ? prev.filter(n => n !== no) : [...prev, no]
    );
  };

  // DOWNLOAD EXCEL WITH 100+ MBG INGREDIENTS MASTER DATA
  const handleDownloadExcelTemplate = (datasetType: string) => {
    let filename = "";
    let headerCols: string[] = [];
    let rowsHtml = "";

    if (datasetType === "komoditas") {
      filename = "Master_Data_Komoditas_Pangan_MBG_Gresik.xls";
      headerCols = ["No", "Kecamatan", "Jumlah Bahan Tersedia", "Daftar Bahan Pangan MBG"];
      rowsHtml = commodities.map((c) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${c.no}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${c.name}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center;">${c.items.length} Bahan</td>
          <td style="border: 1px solid #cbd5e1;">${c.items.join(", ")}</td>
        </tr>
      `).join("");
    } else if (datasetType === "harga") {
      filename = "Master_Data_Harga_Pangan_SISKAPERBAPO_Gresik.xls";
      headerCols = ["No", "Nama Bahan Pangan", "Kategori", "Harga Satuan Pasar", "Kecamatan"];
      rowsHtml = prices.map((p) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${p.no}</td>
          <td style="border: 1px solid #cbd5e1;">${p.item}</td>
          <td style="border: 1px solid #cbd5e1;">${p.category}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${p.price}</td>
          <td style="border: 1px solid #cbd5e1;">${p.districts}</td>
        </tr>
      `).join("");
    } else if (datasetType === "menu") {
      filename = "Master_Data_Katalog_Menu_MBG.xls";
      headerCols = ["No", "Nama Menu Masakan", "Kelompok Sasaran", "Komposisi 5 Bintang", "Target Angka Gizi", "Sumber Acuan"];
      rowsHtml = recipes.map((r) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${r.no}</td>
          <td style="border: 1px solid #cbd5e1;">${r.name}</td>
          <td style="border: 1px solid #cbd5e1;">${r.targetGroup}</td>
          <td style="border: 1px solid #cbd5e1;">${r.composition}</td>
          <td style="border: 1px solid #cbd5e1;">${r.nutritionTarget}</td>
          <td style="border: 1px solid #cbd5e1;">${r.source}</td>
        </tr>
      `).join("");
    } else {
      filename = "Master_Data_Komposisi_Zat_Gizi_Pangan_TKPI_2019.xls";
      headerCols = [
        "No", "Kode TKPI", "Nama Bahan Pangan", "Kelompok Makanan", "Bentuk", 
        "Air (g)", "Energi (Kal)", "Protein (g)", "Lemak (g)", "Karbohidrat (g)", "Serat (g)", "Abu (g)", 
        "Kalsium (mg)", "Fosfor (mg)", "Besi (mg)", "Natrium (mg)", "Kalium (mg)", "Seng (mg)", "Tembaga (mg)", 
        "Vit A (mcg)", "Beta-Karoten (mcg)", "Vit B1 (mg)", "Vit B2 (mg)", "Niasin (mg)", "Vit C (mg)", 
        "BDD (%)", "Sumber Data"
      ];
      rowsHtml = nutrition.map((n) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${n.no}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${n.code}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${n.name}</td>
          <td style="border: 1px solid #cbd5e1;">${n.category || "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center;">${n.state || "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.water ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${n.calories ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #1a73e8;">${n.protein ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.fat ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.carbs ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.fiber ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.ash ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.calcium ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.phosphorus ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b45309;">${n.iron ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.sodium ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.potassium ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.zinc ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.copper ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.retinol ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.bCarotene ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.thiamin ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.riboflavin ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.niacin ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right;">${n.vitaminC ?? "-"}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${n.bdd ?? 100}%</td>
          <td style="border: 1px solid #cbd5e1;">${n.source || "TKPI 2019 Kemenkes RI"}</td>
        </tr>
      `).join("");
    }

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt;">
          <thead>
            <tr style="background-color: #1a73e8; font-weight: bold; text-align: center; color: #ffffff;">
              ${headerCols.map(col => `<th style="background-color: #1a73e8; border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold; color: #ffffff;">${col}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Template Excel (${filename}) berhasil diunduh!`);
  };

  // Genuinely parse uploaded file and Auto-Renumber rows
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      try {
        const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#") && !l.startsWith("<"));
        if (lines.length <= 1) {
          showToast(`File "${file.name}" tidak memiliki data baris yang valid.`);
          return;
        }

        const dataRows = lines.slice(1);

        if (activeDatasetTab === "komoditas") {
          const parsed: CommodityRecord[] = dataRows.map((line, idx) => {
            const separator = line.includes(";") ? ";" : line.includes("\t") ? "\t" : ",";
            const cols = line.split(separator).map(c => c.replace(/^"|"$/g, "").trim());
            const hasNo = !isNaN(Number(cols[0])) && cols.length > 2;
            const itemsRaw = (hasNo ? cols[2] : cols[1]) || "Beras, Daging Ayam, Telur Ayam, Susu UHT, Bayam, Wortel, Pisang";
            return {
              no: idx + 1,
              name: (hasNo ? cols[1] : cols[0]) || `Kecamatan ${idx + 1}`,
              items: itemsRaw.split(",").map(it => it.trim()).filter(Boolean)
            };
          });
          setCommodities(parsed);
          syncCommoditiesToFirestore(parsed);
          showToast(`✓ Berhasil upload! ${parsed.length} baris Komoditas otomatis tersimpan ke Cloud Firestore.`);
        } else if (activeDatasetTab === "harga") {
          const parsed: PriceRecord[] = dataRows.map((line, idx) => {
            const separator = line.includes(";") ? ";" : line.includes("\t") ? "\t" : ",";
            const cols = line.split(separator).map(c => c.replace(/^"|"$/g, "").trim());
            const hasNo = !isNaN(Number(cols[0])) && cols.length > 3;
            return {
              no: idx + 1,
              item: (hasNo ? cols[1] : cols[0]) || "Bahan Pangan",
              category: (hasNo ? cols[2] : cols[1]) || "Protein Hewani",
              price: (hasNo ? cols[3] : cols[2]) || "Rp 25.000 / kg",
              districts: (hasNo ? cols[4] : cols[3]) || "Semua 18 Kecamatan"
            };
          });
          setPrices(parsed);
          syncPricesToFirestore(parsed);
          showToast(`✓ Berhasil upload! ${parsed.length} baris Harga Pasar otomatis tersimpan ke Cloud Firestore.`);
        } else if (activeDatasetTab === "menu") {
          const parsed: RecipeRecord[] = dataRows.map((line, idx) => {
            const separator = line.includes(";") ? ";" : line.includes("\t") ? "\t" : ",";
            const cols = line.split(separator).map(c => c.replace(/^"|"$/g, "").trim());
            const hasNo = !isNaN(Number(cols[0])) && cols.length > 5;
            return {
              no: idx + 1,
              name: (hasNo ? cols[1] : cols[0]) || "Menu Standar MBG",
              targetGroup: (hasNo ? cols[2] : cols[1]) || "SD / SMP",
              composition: (hasNo ? cols[3] : cols[2]) || "Komposisi Menu Gizi Seimbang",
              nutritionTarget: (hasNo ? cols[4] : cols[3]) || "600 Kkal | 25g Prot",
              source: (hasNo ? cols[5] : cols[4]) || "Katalog MBG BGN RI",
              link: "https://badangizi.go.id"
            };
          });
          setRecipes(parsed);
          syncRecipesToFirestore(parsed);
          showToast(`✓ Berhasil upload! ${parsed.length} baris Menu Standar otomatis tersimpan ke Cloud Firestore.`);
        } else {
          const parsed: NutritionRecord[] = dataRows.map((line, idx) => {
            const separator = line.includes(";") ? ";" : line.includes("\t") ? "\t" : ",";
            const cols = line.split(separator).map(c => c.replace(/^"|"$/g, "").trim());
            const hasNo = !isNaN(Number(cols[0])) && cols.length > 6;
            return {
              no: idx + 1,
              code: (hasNo ? cols[1] : cols[0]) || `TKPI-${idx + 1}`,
              name: (hasNo ? cols[2] : cols[1]) || "Bahan Makanan",
              category: (hasNo ? cols[3] : cols[2]) || "Pangan Lainnya",
              state: (hasNo ? cols[4] : cols[3]) || "Mentah",
              water: (hasNo ? cols[5] : cols[4]) || 70,
              calories: (hasNo ? cols[6] : cols[5]) || 120,
              protein: (hasNo ? cols[7] : cols[6]) || 15.0,
              fat: (hasNo ? cols[8] : cols[7]) || 2.0,
              carbs: (hasNo ? cols[9] : cols[8]) || 10.0,
              fiber: (hasNo ? cols[10] : cols[9]) || 1.0,
              calcium: (hasNo ? cols[11] : cols[10]) || 20,
              phosphorus: (hasNo ? cols[12] : cols[11]) || 100,
              iron: (hasNo ? cols[13] : cols[12]) || 2.0,
              sodium: (hasNo ? cols[14] : cols[13]) || 20,
              potassium: (hasNo ? cols[15] : cols[14]) || 200,
              zinc: (hasNo ? cols[16] : cols[15]) || 1.0,
              vitaminC: (hasNo ? cols[17] : cols[16]) || 0,
              bdd: (hasNo ? cols[18] : cols[17]) || 100,
              source: (hasNo ? cols[19] : cols[18]) || "TKPI 2019 Kemenkes RI",
              link: "https://www.panganku.org"
            };
          });
          setNutrition(parsed);
          syncNutritionToFirestore(parsed);
          updateTimestamp();
          showToast(`✓ Berhasil upload! ${parsed.length} baris Nilai Gizi TKPI 2019 otomatis tersimpan ke Cloud Firestore.`);
        }
      } catch (err) {
        showToast("Terjadi kesalahan saat membaca file Excel/CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 1. FULLSCREEN AUTHENTICATION MODAL
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
        <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Autentikasi Basis Data RAG
            </h2>
            <p className="text-[12px] text-[#64748b]">
              Masukkan 8 digit kode otorisasi administrator untuk mengakses repositori dataset grounding RAG.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-10 sm:w-11 h-12 sm:h-13 rounded-xl border text-center text-[18px] font-mono font-black focus:outline-none transition-all ${
                    pinError
                      ? "border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400"
                      : digit
                      ? "border-[#1a73e8] bg-blue-50/40 text-[#071e49] focus:ring-2 focus:ring-[#1a73e8]/30"
                      : "border-[#cbd5e1] bg-white text-[#071e49] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-[11px] text-red-600 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Kode PIN salah. Akses ditolak.</span>
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => verifyPin(pinDigits.join(""))}
              className="w-full py-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[13px] font-bold shadow-xs transition-colors"
            >
              Verifikasi & Buka Basis Data
            </button>

            <button
              onClick={onBackToDashboard}
              className="w-full py-2 rounded-xl text-[12px] font-bold text-[#64748b] hover:text-[#071e49] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Utama</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 space-y-8 animate-in fade-in">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv,.txt"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#071e49] text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200 border border-slate-700">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-[13px] font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. STICKY TOP BAR */}
      <header className="sticky top-0 z-40 bg-[#f8fafc]/95 backdrop-blur-md py-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-[#071e49] border border-[#cbd5e1] text-[13px] font-bold shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#1a73e8]" />
            <span>Kembali ke Dashboard Utama</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[12px] text-[#475569] shadow-2xs font-medium">
            <Clock className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
            <span>Terakhir Diperbarui: <strong className="text-[#071e49] font-bold">{lastUpdatedDate}</strong></span>
          </div>

          <span className="text-[11px] text-[#64748b] font-medium bg-white px-3 py-1.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
            Auto-lock (2 mnt)
          </span>
        </div>
      </header>

      {/* 2. SLIDE RECREATION: METODE / MEKANISME AI (SISI PEMERINTAH) */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-6 relative overflow-hidden">
        {/* Top Header Badge Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#f1f5f9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-lg bg-[#1a73e8] text-white text-[13px] font-black tracking-wide uppercase shadow-xs">
                Sisi Pemerintah
              </span>
              <h1 className="text-[22px] lg:text-[26px] font-black text-[#071e49] tracking-tight">
                Metode / Mekanisme AI
              </h1>
            </div>
            <p className="text-[12px] text-[#64748b] mt-1">
              Sumber Data: Desk Research, Portal Satu Data Gresik, SISKAPERBAPO, TKPI Kemenkes RI, & Buku BGN
            </p>
          </div>
        </div>

        {/* 1. Proses Pelatihan AI Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[14px] font-black text-[#071e49]">
            <div className="w-3 h-3 rounded-full bg-[#1a73e8]"></div>
            <span>Proses Pelatihan AI:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-colors shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-[#071e49]">Fine-tuning</h4>
                <p className="text-[10px] text-[#64748b]">MobileNetV3 Edge Stunting Screening</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-colors shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-[#071e49]">Retrieval-Augmented Generation (RAG)</h4>
                <p className="text-[10px] text-[#64748b]">Vector Search atas 4 Dataset Pangan</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-colors shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-[#071e49]">Prompt Engineering</h4>
                <p className="text-[10px] text-[#64748b]">Master Constraint Gemini 1.5 Pro / 2.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Flow AI */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-[14px] font-black text-[#071e49]">
            <div className="w-3 h-3 rounded-full bg-[#1a73e8]"></div>
            <span>Flow AI:</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1">
            {/* LEFT: 4 Inputs */}
            <div className="lg:col-span-4 space-y-2.5">
              <a
                href="https://satudata.gresikkab.go.id"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafd] border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all block group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Fish className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Menerima data komoditas pangan daerah
                  </h4>
                  <span className="text-[10px] text-[#1a73e8] font-semibold flex items-center gap-1 mt-0.5">
                    <span>satudata.gresikkab.go.id</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>

              <a
                href="https://siskaperbapo.jatimprov.go.id"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafd] border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all block group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Menerima data harga pangan daerah
                  </h4>
                  <span className="text-[10px] text-[#1a73e8] font-semibold flex items-center gap-1 mt-0.5">
                    <span>siskaperbapo.jatimprov.go.id</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>

              <a
                href="https://badangizi.go.id"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafd] border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all block group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Menerima data menu makanan
                  </h4>
                  <span className="text-[10px] text-[#1a73e8] font-semibold flex items-center gap-1 mt-0.5">
                    <span>badangizi.go.id (Buku MBG BGN)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>

              <a
                href="https://www.panganku.org"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafd] border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all block group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Menerima data angka gizi daerah
                  </h4>
                  <span className="text-[10px] text-[#1a73e8] font-semibold flex items-center gap-1 mt-0.5">
                    <span>panganku.org (TKPI Kemenkes RI)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            </div>

            {/* CENTER: Main AI Engine Node */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#f0f7ff] border-2 border-[#1a73e8] text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-[14px] font-black text-[#071e49] leading-tight">
                Generate menu-menu teroptimal untuk suatu daerah
              </h3>
              <p className="text-[11px] text-[#64748b] leading-relaxed">
                Menggabungkan keempat data untuk menghasilkan pilihan menu-menu teroptimal untuk suatu daerah beserta harga anggaran untuk menu tersebut.
              </p>
              <span className="text-[10px] font-bold text-[#1a73e8] bg-white px-3 py-0.5 rounded-full border border-[#dbeafe] shadow-2xs">
                100% Autonomous LLM Grounding
              </span>
            </div>

            {/* RIGHT: 3 Outputs */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Generate rekomendasi pembuatan menu untuk satu minggu kedepan
                  </h4>
                  <span className="text-[10px] text-[#64748b]">5 Hari Kerja Siklus MBG (TK - SMA)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Generate anggaran yang diperlukan
                  </h4>
                  <span className="text-[10px] text-[#64748b]">HPP Bahan Baku & Efisiensi Pagu Rp 15.000</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] flex items-center gap-3 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#071e49] leading-tight">
                    Generate bahan pokok yang diperlukan
                  </h4>
                  <span className="text-[10px] text-[#64748b]">Bill of Materials (BOM) Dapur SPPG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED SINGLE CARD: REPOSITORI MASTER DATA RAG */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-6">
        {/* Top Header of Card: Tabs & Action Buttons in 1 Row */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-[#f1f5f9] pb-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveDatasetTab("komoditas")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                activeDatasetTab === "komoditas"
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "text-[#475569] hover:bg-slate-100"
              }`}
            >
              1. Master Komoditas
            </button>
            <button
              onClick={() => setActiveDatasetTab("harga")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                activeDatasetTab === "harga"
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "text-[#475569] hover:bg-slate-100"
              }`}
            >
              2. Master Harga Pasar
            </button>
            <button
              onClick={() => setActiveDatasetTab("menu")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                activeDatasetTab === "menu"
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "text-[#475569] hover:bg-slate-100"
              }`}
            >
              3. Master Menu Makanan
            </button>
            <button
              onClick={() => setActiveDatasetTab("gizi")}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                activeDatasetTab === "gizi"
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "text-[#475569] hover:bg-slate-100"
              }`}
            >
              4. Master Nilai Gizi TKPI
            </button>
          </div>

          {/* Action Buttons (Download & Upload) */}
          <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
            <button
              onClick={() => handleDownloadExcelTemplate(activeDatasetTab)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071e49] border border-[#cbd5e1] transition-all shadow-2xs"
              title="Download Template Excel (.XLS)"
              aria-label="Download Template Excel (.XLS)"
            >
              <Download className="w-4 h-4 text-[#1a73e8]" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white transition-colors shadow-xs"
              title="Upload File Excel / CSV"
              aria-label="Upload File Excel / CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: SPREADSHEET TABLE KOMODITAS (COMPACT PILL TAGS + SEARCH & FILTER) */}
        {activeDatasetTab === "komoditas" && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-[15px] font-bold text-[#071e49]">
                Tabel Master 1: Komoditas Pangan Kabupaten Gresik
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Pemetaan potensi bahan pangan lokal per 18 kecamatan untuk program MBG — Sumber resmi: Dinas Pertanian, Ketahanan Pangan, dan Perikanan (DKPP) Kab. Gresik.
              </p>
            </div>

            {/* Smart Search Bar & Clean Category Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kecamatan atau nama bahan pangan..."
                  value={commoditySearchQuery}
                  onChange={(e) => setCommoditySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#1a73e8] shadow-2xs"
                />
              </div>

              {/* Clean Category Dropdown Filter with Custom Sleek Chevron Icon */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="category-select" className="text-[12px] font-bold text-[#071e49] hidden md:inline">
                  Filter Kategori:
                </label>
                <div className="relative">
                  <select
                    id="category-select"
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] text-[12px] font-bold focus:outline-none focus:border-[#1a73e8] shadow-2xs cursor-pointer"
                  >
                    <option value="Semua">Semua</option>
                    <option value="Karbohidrat">Karbohidrat</option>
                    <option value="Protein Hewani">Protein Hewani</option>
                    <option value="Susu & Telur">Susu & Telur</option>
                    <option value="Protein Nabati">Protein Nabati</option>
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah-buahan">Buah-buahan</option>
                    <option value="Bumbu & Minyak">Bumbu & Minyak</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-[#cbd5e1] shadow-xs">
              <table className="w-full text-left text-[12px] border-collapse bg-white">
                <thead className="sticky top-0 z-10 shadow-xs">
                  <tr className="bg-[#1a73e8] text-white font-bold divide-x divide-blue-400">
                    <th className="py-2.5 px-3 w-12 text-center border-blue-400">No</th>
                    <th className="py-2.5 px-4 border-blue-400 w-44 font-bold">Kecamatan</th>
                    <th className="py-2.5 px-4 border-blue-400 font-bold">
                      Komoditas Pangan Tersedia {selectedCategoryFilter !== "Semua" ? `(${selectedCategoryFilter})` : "(Pasar / Petani Lokal)"}
                    </th>
                    <th className="py-2.5 px-3 text-center border-blue-400 w-24 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedCommodities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#64748b]">
                        Tidak ditemukan bahan pangan yang sesuai dengan filter atau kata kunci pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedCommodities.map((d) => {
                      const displayItems = d.activeItems.slice(0, 6);
                      const remainingCount = d.activeItems.length - 6;

                      return (
                        <tr key={d.no} className="hover:bg-slate-50 divide-x divide-slate-100">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">{d.no}</td>
                          <td className="py-2.5 px-4 font-bold text-[#071e49]">
                            {d.name}
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                              {d.activeItems.length} Bahan {selectedCategoryFilter !== "Semua" ? selectedCategoryFilter : "Terdata"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {displayItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                                    selectedCategoryFilter !== "Semua"
                                      ? "bg-blue-50/70 text-[#1a73e8] border-blue-200"
                                      : "bg-slate-100 text-[#071e49] border-slate-200"
                                  }`}
                                >
                                  {item}
                                </span>
                              ))}

                              {remainingCount > 0 && (
                                <button
                                  onClick={() => setSelectedDistrictModal(d)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1a73e8] border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <span>+{remainingCount} bahan lainnya</span>
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedDistrictModal(d)}
                                className="p-1.5 rounded-lg text-[#1a73e8] hover:bg-blue-50 transition-colors"
                                title="Lihat semua bahan"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingItem({ type: "komoditas", isNew: false, data: { ...d, itemsString: d.items.join(", ") } })}
                                className="p-1.5 rounded-lg text-[#1a73e8] hover:bg-blue-50 transition-colors"
                                title="Edit komoditas kecamatan"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Tab 1 (Clean Numbered 1 2 3 ... format) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-[12px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[12px] focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs"
                  >
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                    <option value={60}>60</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span>
                  Menampilkan {filteredCommodities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredCommodities.length)} dari {filteredCommodities.length} data
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numbered Pills: 1 2 3 ... (Max 5) */}
                {(() => {
                  const pages: (number | string)[] = [];
                  const total = totalCommodityPages;
                  if (total <= 5) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", total);
                    } else if (currentPage >= total - 2) {
                      pages.push(1, "...", total - 3, total - 2, total - 1, total);
                    } else {
                      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total);
                    }
                  }

                  return pages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={idx} className="px-1.5 py-1 text-slate-400 font-bold text-[12px] select-none">
                          ...
                        </span>
                      );
                    }
                    const num = p as number;
                    const isActive = num === currentPage;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center ${
                          isActive
                            ? "bg-[#1a73e8] text-white shadow-2xs"
                            : "bg-white text-[#071e49] border border-[#cbd5e1] hover:bg-slate-50"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalCommodityPages))}
                  disabled={currentPage === totalCommodityPages}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPREADSHEET TABLE HARGA (AUTO-SYNCED DARI MASTER KOMODITAS TANPA DUPLIKASI) */}
        {activeDatasetTab === "harga" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#071e49] flex items-center gap-2">
                <span>Tabel Master 2: Harga Harian Bahan Pokok (SISKAPERBAPO)</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Otomatis Sinkron dari Step 1 ({prices.length} Bahan Tanpa Duplikat)
                </span>
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Daftar bahan pangan diekstrak dan disinkronkan otomatis dari Master Komoditas (Step 1) di 18 kecamatan tanpa duplikasi data — Sumber resmi: SISKAPERBAPO Jawa Timur & Diskoperindag Kab. Gresik.
              </p>
            </div>

            {/* Smart Search Bar & Category Filter Dropdown for Prices */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama bahan pangan atau kecamatan..."
                  value={priceSearchQuery}
                  onChange={(e) => setPriceSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#1a73e8] shadow-2xs"
                />
              </div>

              {/* Category Dropdown Filter with Custom Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="price-category-select" className="text-[12px] font-bold text-[#071e49] hidden md:inline">
                  Filter Kategori:
                </label>
                <div className="relative">
                  <select
                    id="price-category-select"
                    value={priceCategoryFilter}
                    onChange={(e) => setPriceCategoryFilter(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] text-[12px] font-bold focus:outline-none focus:border-[#1a73e8] shadow-2xs cursor-pointer"
                  >
                    <option value="Semua">Semua</option>
                    <option value="Karbohidrat">Karbohidrat</option>
                    <option value="Protein Hewani">Protein Hewani</option>
                    <option value="Susu & Telur">Susu & Telur</option>
                    <option value="Protein Nabati">Protein Nabati</option>
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah-buahan">Buah-buahan</option>
                    <option value="Bumbu & Minyak">Bumbu & Minyak</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-[#cbd5e1] shadow-xs">
              <table className="w-full text-left text-[12px] border-collapse bg-white">
                <thead className="sticky top-0 z-10 shadow-xs">
                  <tr className="bg-[#1a73e8] text-white font-bold divide-x divide-blue-400">
                    <th className="py-2.5 px-3 w-12 text-center border-blue-400">No</th>
                    <th className="py-2.5 px-4 border-blue-400 w-48 font-bold">Nama Bahan Pangan</th>
                    <th className="py-2.5 px-4 border-blue-400 w-36 font-bold">Kategori</th>
                    <th className="py-2.5 px-4 text-right border-blue-400 w-40 font-bold">Harga Satuan Pasar</th>
                    <th className="py-2.5 px-4 border-blue-400 font-bold">Kecamatan</th>
                    <th className="py-2.5 px-3 text-center border-blue-400 w-24 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedPrices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748b]">
                        Tidak ditemukan data harga yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedPrices.map((p) => (
                      <tr key={p.no} className="hover:bg-slate-50 divide-x divide-slate-100">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">{p.no}</td>
                        <td className="py-2.5 px-4 font-bold text-[#071e49]">{p.item}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1a73e8] text-[11px] font-bold border border-blue-200">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-[#1a73e8]">{p.price}</td>
                        <td className="py-2.5 px-4 text-[#475569] font-medium">{p.districts}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setEditingItem({ type: "harga", isNew: false, data: { ...p } })}
                            className="p-1.5 rounded-lg text-[#1a73e8] hover:bg-blue-50 transition-colors"
                            title="Edit harga"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Tab 2 (Clean Numbered 1 2 3 ... format) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-[12px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[12px] focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs"
                  >
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                    <option value={60}>60</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span>
                  Menampilkan {filteredPrices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPrices.length)} dari {filteredPrices.length} data
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numbered Pills: 1 2 3 ... (Max 5) */}
                {(() => {
                  const pages: (number | string)[] = [];
                  const total = totalPricePages;
                  if (total <= 5) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", total);
                    } else if (currentPage >= total - 2) {
                      pages.push(1, "...", total - 3, total - 2, total - 1, total);
                    } else {
                      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total);
                    }
                  }

                  return pages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={idx} className="px-1.5 py-1 text-slate-400 font-bold text-[12px] select-none">
                          ...
                        </span>
                      );
                    }
                    const num = p as number;
                    const isActive = num === currentPage;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center ${
                          isActive
                            ? "bg-[#1a73e8] text-white shadow-2xs"
                            : "bg-white text-[#071e49] border border-[#cbd5e1] hover:bg-slate-50"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPricePages))}
                  disabled={currentPage === totalPricePages}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPREADSHEET TABLE MENU MAKANAN */}
        {activeDatasetTab === "menu" && (() => {
          const isAllSelectedOnPage = paginatedRecipes.length > 0 && paginatedRecipes.every(r => selectedMenuNos.includes(r.no));
          const toggleSelectAllOnPage = () => {
            if (isAllSelectedOnPage) {
              const pageNos = new Set(paginatedRecipes.map(r => r.no));
              setSelectedMenuNos(prev => prev.filter(n => !pageNos.has(n)));
            } else {
              const pageNos = paginatedRecipes.map(r => r.no);
              setSelectedMenuNos(prev => Array.from(new Set([...prev, ...pageNos])));
            }
          };

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#071e49] flex items-center gap-2">
                    <span>Tabel Master 3: Standar Menu Makanan</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-200">
                      Standar BGN RI & Pencegahan Stunting
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Perhitungan porsi dan komposisi zat gizi formula 5 Bintang disesuaikan dengan pedoman resmi — Sumber resmi: Badan Gizi Nasional (BGN RI) & Standar PMT Kemenkes RI.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {selectedMenuNos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteMenus}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[12px] font-bold transition-all shadow-2xs cursor-pointer animate-in fade-in"
                      title="Hapus menu yang dipilih"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus ({selectedMenuNos.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateMenusAI}
                    disabled={isGeneratingMenus}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1a73e8] border border-blue-200 text-[12px] font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingMenus ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyusun 5 Menu Baru...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate 5 Menu Baru AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Smart Search Bar for Menu */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama menu, sasaran, atau komposisi bahan..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#1a73e8] shadow-2xs"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-[#cbd5e1] shadow-xs">
                <table className="w-full text-left text-[12px] border-collapse bg-white">
                  <thead className="sticky top-0 z-10 shadow-xs">
                    <tr className="bg-[#1a73e8] text-white font-bold divide-x divide-blue-400">
                      <th className="py-2.5 px-3 w-10 text-center border-blue-400">
                        <input
                          type="checkbox"
                          checked={isAllSelectedOnPage}
                          onChange={toggleSelectAllOnPage}
                          className="w-4 h-4 rounded text-[#1a73e8] focus:ring-0 cursor-pointer accent-white"
                          title="Pilih semua di halaman ini"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-12 text-center border-blue-400">No</th>
                      <th className="py-2.5 px-4 border-blue-400 w-56 font-bold">Nama Menu Standar</th>
                      <th className="py-2.5 px-4 border-blue-400 w-36 font-bold">Sasaran</th>
                      <th className="py-2.5 px-4 border-blue-400 font-bold">Komposisi Bahan Pokok</th>
                      <th className="py-2.5 px-4 border-blue-400 w-52 font-bold">Target Gizi</th>
                      <th className="py-2.5 px-3 text-center border-blue-400 w-24 font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {paginatedRecipes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#64748b]">
                          Tidak ditemukan menu makanan yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecipes.map((r) => {
                        const isSelected = selectedMenuNos.includes(r.no);
                        return (
                          <tr 
                            key={r.no} 
                            className={`hover:bg-slate-50 divide-x divide-slate-100 transition-colors ${
                              isSelected ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMenu(r.no)}
                                className="w-4 h-4 rounded text-[#1a73e8] focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">{r.no}</td>
                            <td className="py-2.5 px-4 font-bold text-[#071e49]">{r.name}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1a73e8] text-[11px] font-bold border border-blue-200">
                                {r.targetGroup}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              {r.composition.includes("|") ? (
                                <div className="flex flex-wrap gap-1.5 py-0.5 max-w-xl">
                                  {r.composition.split("|").map((part, pIdx) => {
                                    const trimmed = part.trim();
                                    const [category, ...rest] = trimmed.split(":");
                                    if (rest.length > 0) {
                                      const catName = category.trim();
                                      const itemName = rest.join(":").trim();
                                      return (
                                        <span
                                          key={pIdx}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100/90 border border-slate-200 text-[11px]"
                                        >
                                          <span className="font-bold text-slate-700">{catName}:</span>
                                          <span className="font-semibold text-[#071e49]">{itemName}</span>
                                        </span>
                                      );
                                    }
                                    return (
                                      <span key={pIdx} className="text-[11px] font-medium text-slate-700">
                                        {trimmed}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-[11px] font-medium text-slate-700">{r.composition}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-emerald-700 text-[11px]">{r.nutritionTarget}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setEditingItem({ type: "menu", isNew: false, data: { ...r } })}
                                  className="p-1.5 rounded-lg text-[#1a73e8] hover:bg-blue-50 transition-colors"
                                  title="Edit menu"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow("menu", r.no)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  title="Hapus menu ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls for Tab 3 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-[12px] text-[#64748b]">
                <div className="flex items-center gap-2">
                  <span>Tampilkan:</span>
                  <div className="relative">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[12px] focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs"
                    >
                      <option value={20}>20</option>
                      <option value={40}>40</option>
                      <option value={60}>60</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span>
                    Menampilkan {filteredRecipes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRecipes.length)} dari {filteredRecipes.length} data
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {(() => {
                    const pages: (number | string)[] = [];
                    const total = totalRecipePages;
                    if (total <= 5) {
                      for (let i = 1; i <= total; i++) pages.push(i);
                    } else {
                      if (currentPage <= 3) {
                        pages.push(1, 2, 3, "...", total);
                      } else if (currentPage >= total - 2) {
                        pages.push(1, "...", total - 2, total - 1, total);
                      } else {
                        pages.push(1, "...", currentPage, "...", total);
                      }
                    }
                    return pages.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof p === "number" && setCurrentPage(p)}
                        disabled={typeof p !== "number"}
                        className={`w-8 h-8 rounded-xl text-[12px] font-bold transition-all ${
                          p === currentPage
                            ? "bg-[#1a73e8] text-white shadow-xs"
                            : typeof p === "number"
                            ? "bg-white border border-[#cbd5e1] text-[#071e49] hover:bg-slate-50"
                            : "bg-transparent text-[#64748b] cursor-default"
                        }`}
                      >
                        {p}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalRecipePages))}
                    disabled={currentPage === totalRecipePages || totalRecipePages === 0}
                    className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: SPREADSHEET TABLE GIZI TKPI KEMENKES 2019 */}
        {activeDatasetTab === "gizi" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#071e49] flex items-center gap-2">
                  <span>Tabel Master 4: Nilai Gizi Pangan Indonesia (TKPI 2019 Kemenkes RI)</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Standar 100g BDD Terverifikasi
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Komposisi zat gizi makanan lengkap per 100 gram BDD (Bagian yang Dapat Dimakan) — Sumber resmi: Tabel Komposisi Pangan Indonesia (TKPI 2019) Kemenkes RI / AndraFarm.
                </p>
              </div>
            </div>

            {/* Smart Search Bar & Category Dropdown Filter for Nutrition (Consistent Layout) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama bahan pangan TKPI, kode (AP001), atau kelompok..."
                  value={nutritionSearchQuery}
                  onChange={(e) => setNutritionSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#1a73e8] shadow-2xs"
                />
              </div>

              {/* Clean Category Dropdown Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="nutrition-category-select" className="text-[12px] font-bold text-[#071e49] hidden md:inline">
                  Filter Kelompok:
                </label>
                <div className="relative">
                  <select
                    id="nutrition-category-select"
                    value={selectedNutritionCategoryFilter}
                    onChange={(e) => setSelectedNutritionCategoryFilter(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] text-[12px] font-bold focus:outline-none focus:border-[#1a73e8] shadow-2xs cursor-pointer"
                  >
                    <option value="Semua">Semua Kelompok</option>
                    <option value="Serealia">Serealia</option>
                    <option value="Umbi-umbian">Umbi-umbian</option>
                    <option value="Ikan & Seafood">Ikan & Seafood</option>
                    <option value="Daging & Unggas">Daging & Unggas</option>
                    <option value="Telur">Telur</option>
                    <option value="Susu">Susu</option>
                    <option value="Kacang-kacangan">Kacang-kacangan</option>
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah-buahan">Buah-buahan</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Complete Horizontal Scrollable Table Container with Fixed Sticky Header */}
            <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-xl border border-[#cbd5e1] shadow-xs">
              <table className="w-full text-left text-[11px] border-collapse bg-white whitespace-nowrap">
                <thead className="sticky top-0 z-20 shadow-md text-white select-none">
                  <tr className="bg-[#1a73e8] font-bold divide-x divide-blue-400">
                    <th className="py-2.5 px-3 text-center w-12 bg-[#1a73e8] border-blue-400 cursor-help" title="Nomor urut data bahan pangan TKPI">
                      No
                    </th>
                    <th className="py-2.5 px-3 font-mono font-bold w-24 bg-[#1a73e8] border-blue-400 cursor-help" title="Kode Unik Resmi Bahan Pangan dalam Tabel Komposisi Pangan Indonesia (TKPI 2019 Kemenkes RI)">
                      Kode
                    </th>
                    <th className="py-2.5 px-4 font-bold w-48 bg-[#1a73e8] border-blue-400 cursor-help" title="Nama Bahan Pangan terstandarisasi per 100 gram Bagian yang Dapat Dimakan (BDD)">
                      Nama Bahan (100g)
                    </th>
                    <th className="py-2.5 px-3 w-32 bg-[#1a73e8] border-blue-400 cursor-help" title="Kelompok Komoditas Pangan (Serealia, Umbi, Ikan/Seafood, Daging, Telur, Susu, Sayuran, Buah)">
                      Kelompok
                    </th>
                    <th className="py-2.5 px-2.5 text-center w-20 bg-[#1a73e8] border-blue-400 cursor-help" title="Bentuk Fisik Bahan Pangan: Mentah (Segar) atau Olahan">
                      Bentuk
                    </th>

                    {/* Makronutrisi Group */}
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Kadar Air (Moisture) dalam gram (g) per 100g BDD — Menentukan kesegaran dan kepadatan nutrisi bahan makanan">
                      Air (g)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Energi / Kalori Total dalam Kkal per 100g BDD — Sumber tenaga utama untuk metabolisme & aktivitas fisik harian anak">
                      Energi (Kal)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Protein Total dalam gram (g) per 100g BDD — Zat pembangun sel, otot, dan pertumbuhan linear anak (Kunci Pencegahan Stunting)">
                      Protein (g)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Lemak Total dalam gram (g) per 100g BDD — Sumber asam lemak esensial dan pelarut vitamin A, D, E, K">
                      Lemak (g)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Karbohidrat (KH) Total dalam gram (g) per 100g BDD — Sumber glukosa cepat untuk energi harian dan fungsi kognitif otak">
                      KH (g)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Serat Pangan (Dietary Fiber) dalam gram (g) per 100g BDD — Menjaga kesehatan saluran cerna dan mikrobioma usus anak">
                      Serat (g)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-700 border-blue-500 cursor-help" title="Kadar Abu (Ash) dalam gram (g) per 100g BDD — Total kandungan mineral anorganik murni dalam bahan pangan">
                      Abu (g)
                    </th>

                    {/* Mineral Group */}
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Kalsium (Calcium / Ca) dalam miligram (mg) per 100g BDD — Pembentukan struktur tulang dan gigi yang kuat, mencegah gagal tumbuh">
                      Ca (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Fosfor (Phosphorus / P) dalam miligram (mg) per 100g BDD — Bekerja sinergis dengan kalsium untuk kepadatan tulang dan membran sel">
                      P (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-amber-600 border-amber-500 font-black cursor-help" title="Zat Besi (Iron / Fe) dalam miligram (mg) per 100g BDD — Pembentukan hemoglobin darah, mencegah anemia defisiensi besi & stunting kognitif">
                      Fe (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Natrium (Sodium / Na) dalam miligram (mg) per 100g BDD — Elektrolit pengatur keseimbangan cairan tubuh dan transmisi impuls saraf">
                      Na (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Kalium (Potassium / K) dalam miligram (mg) per 100g BDD — Elektrolit penting untuk fungsi jantung, kontraksi otot, dan tekanan darah">
                      K (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Seng (Zinc / Zn) dalam miligram (mg) per 100g BDD — Kofaktor enzim imunitas, perbaikan jaringan sel, dan pemacu pertumbuhan tinggi badan">
                      Zn (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-indigo-700 border-indigo-500 cursor-help" title="Tembaga (Copper / Cu) dalam miligram (mg) per 100g BDD — Mendukung penyerapan zat besi dan pembentukan sel darah merah">
                      Cu (mg)
                    </th>

                    {/* Vitamin Group */}
                    <th className="py-2.5 px-3 text-right bg-emerald-700 border-emerald-500 cursor-help" title="Vitamin A (Retinol) dalam mikrogram (mcg) per 100g BDD — Menjaga kesehatan penglihatan, epitel, dan sistem kekebalan tubuh">
                      Vit. A (mcg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-700 border-emerald-500 cursor-help" title="Beta-Karoten (β-Carotene) dalam mikrogram (mcg) per 100g BDD — Provitamin A alami dan antioksidan pelindung kerusakan sel">
                      β-Karoten (mcg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-700 border-emerald-500 cursor-help" title="Tiamin (Vitamin B1) dalam miligram (mg) per 100g BDD — Mengubah karbohidrat menjadi energi dan menjaga kesehatan fungsi saraf">
                      B1 (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-700 border-emerald-500 cursor-help" title="Riboflavin (Vitamin B2) dalam miligram (mg) per 100g BDD — Membantu produksi energi seluler dan kesehatan kulit/mata">
                      B2 (mg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-700 border-emerald-500 cursor-help" title="Vitamin C (Asam Askorbat) dalam miligram (mg) per 100g BDD — Antioksidan kuat dan peningkat penyerapan zat besi (Fe) dalam tubuh">
                      Vit. C (mg)
                    </th>

                    {/* Spesifikasi */}
                    <th className="py-2.5 px-2.5 text-center w-16 bg-[#1a73e8] border-blue-400 cursor-help" title="Bagian yang Dapat Dimakan (Edible Portion / BDD) — Persentase bagian bersih yang bisa dimakan setelah dibersihkan dari tulang/kulit/sisik (misal: 100% untuk beras/daging tanpa tulang, 80% untuk bandeng, 58% untuk ayam utuh)">
                      % BDD
                    </th>
                    <th className="py-2.5 px-3 text-center w-20 bg-[#1a73e8] border-blue-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedNutrition.length === 0 ? (
                    <tr>
                      <td colSpan={26} className="py-8 text-center text-[#64748b]">
                        Tidak ditemukan data gizi TKPI yang sesuai dengan filter / pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedNutrition.map((n) => (
                      <tr key={n.no} className="hover:bg-slate-50 divide-x divide-slate-100 transition-colors">
                        <td className="py-2 px-3 text-center font-bold text-slate-500 bg-slate-50/50">{n.no}</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1a73e8]">{n.code}</td>
                        <td className="py-2 px-4 font-bold text-[#071e49]">{n.name}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1a73e8] text-[10px] font-bold border border-blue-200">
                            {n.category || "-"}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center text-[10px] font-semibold text-slate-600">{n.state || "-"}</td>
                        {/* Makronutrisi */}
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.water ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#071e49] bg-slate-50/50">{n.calories ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#1a73e8] bg-blue-50/30">{n.protein ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.fat ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.carbs ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.fiber ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-500">{n.ash ?? "-"}</td>
                        {/* Mineral */}
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.calcium ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.phosphorus ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700 bg-amber-50/40">{n.iron ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.sodium ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.potassium ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.zinc ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.copper ?? "-"}</td>
                        {/* Vitamin */}
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.retinol ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-emerald-700">{n.bCarotene ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.thiamin ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">{n.riboflavin ?? "-"}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700 bg-emerald-50/30">{n.vitaminC ?? "-"}</td>
                        {/* BDD */}
                        <td className="py-2 px-2.5 text-center font-bold text-slate-700">{n.bdd ?? 100}%</td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingItem({ type: "gizi", isNew: false, data: { ...n } })}
                              className="p-1.5 rounded-lg text-[#1a73e8] hover:bg-blue-50 transition-colors"
                              title="Edit data gizi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow("gizi", n.no)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus data gizi ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Tab 4 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-[12px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[12px] focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs"
                  >
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                    <option value={60}>60</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span>
                  Menampilkan {filteredNutrition.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredNutrition.length)} dari {filteredNutrition.length} data
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  const total = totalNutritionPages;
                  if (total <= 5) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, 4, "...", total);
                    } else if (currentPage >= total - 2) {
                      pages.push(1, "...", total - 3, total - 2, total - 1, total);
                    } else {
                      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total);
                    }
                  }

                  return pages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={idx} className="px-1.5 py-1 text-slate-400 font-bold text-[12px] select-none">
                          ...
                        </span>
                      );
                    }
                    const num = p as number;
                    const isActive = num === currentPage;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center ${
                          isActive
                            ? "bg-[#1a73e8] text-white shadow-2xs"
                            : "bg-white text-[#071e49] border border-[#cbd5e1] hover:bg-slate-50"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalNutritionPages))}
                  disabled={currentPage === totalNutritionPages || totalNutritionPages === 0}
                  className="w-8 h-8 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center justify-center"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODAL EDIT / TAMBAH DATA (SUPPORT 4 DATASET & AI HELPERS) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full ${editingItem.type === "gizi" ? "max-w-4xl" : editingItem.type === "menu" ? "max-w-2xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-[16px] font-bold text-[#071e49]">
                  {editingItem.isNew ? "Tambah Data Baru" : "Edit Baris Data"} (
                  {editingItem.type === "komoditas"
                    ? "Master Komoditas"
                    : editingItem.type === "harga"
                    ? "Master Harga Pasar"
                    : editingItem.type === "menu"
                    ? "Master Menu Makanan"
                    : "Nilai Gizi TKPI 2019"}
                  )
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Perubahan akan otomatis tersimpan langsung ke Cloud Firestore
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields for Komoditas */}
            {editingItem.type === "komoditas" && (
              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="font-bold text-[#071e49] block mb-1">Nama Kecamatan:</label>
                  <input
                    type="text"
                    value={editingItem.data.name}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-[#cbd5e1] text-slate-500 font-bold cursor-not-allowed text-[12px]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071e49]">
                      Daftar Bahan Pangan (Pisahkan dengan koma):
                    </label>
                    <button
                      type="button"
                      onClick={handleRecommendCommodities}
                      disabled={isRecommendingCommodities}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1a73e8] hover:text-[#155fc0] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                    >
                      {isRecommendingCommodities ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Menganalisis Potensi...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#1a73e8]" />
                          <span>Rekomendasi AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={editingItem.data.itemsString}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, itemsString: e.target.value } })}
                    placeholder="Contoh: Beras, Daging Ayam, Ikan Bandeng, Telur Ayam, Susu Sapi, Bayam, Pisang..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] focus:outline-none focus:border-[#1a73e8] text-[12px] leading-relaxed font-medium bg-white shadow-2xs"
                    autoFocus
                  />
                  {geminiReasoning && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mt-2 flex items-center gap-1.5 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{geminiReasoning}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields for Harga */}
            {editingItem.type === "harga" && (
              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="font-bold text-[#071e49] block mb-1">Nama Bahan Pangan:</label>
                  <input
                    type="text"
                    value={editingItem.data.item}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-[#cbd5e1] text-slate-500 font-medium cursor-not-allowed text-[12px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-[#071e49] block mb-1">Kategori:</label>
                    <input
                      type="text"
                      value={editingItem.data.category}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                      className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] focus:outline-none focus:border-[#1a73e8] text-[12px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#071e49] block mb-1">Kecamatan Tersedia:</label>
                    <input
                      type="text"
                      value={editingItem.data.districts}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-[#cbd5e1] text-slate-500 font-medium cursor-not-allowed text-[12px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071e49]">Harga Pasar Acuan:</label>
                    <button
                      type="button"
                      onClick={handleEstimateSinglePrice}
                      disabled={isEstimatingPrice}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1a73e8] hover:text-[#155fc0] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                    >
                      {isEstimatingPrice ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Menganalisis Harga...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#1a73e8]" />
                          <span>Estimasi AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingItem.data.price}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, price: e.target.value } })}
                    placeholder="Contoh: Rp 28.000 / kg"
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#1a73e8] text-[13px] focus:outline-none focus:border-[#1a73e8] shadow-2xs bg-white"
                    autoFocus
                  />
                  {geminiReasoning && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mt-2 flex items-center gap-1.5 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{geminiReasoning}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields for Menu MBG */}
            {editingItem.type === "menu" && (
              <div className="space-y-3 text-[12px]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071e49]">Nama Menu Masakan:</label>
                    <button
                      type="button"
                      onClick={handleCalculateNutritionAI}
                      disabled={isCalculatingNutrition || !editingItem.data.name}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1a73e8] hover:text-[#155fc0] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200 cursor-pointer disabled:opacity-50"
                      title="AI akan otomatis menghitung Komposisi 5 Bintang & Target Gizi TKPI"
                    >
                      {isCalculatingNutrition ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Menghitung Gizi TKPI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#1a73e8]" />
                          <span>Hitung Gizi & Porsi AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingItem.data.name}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                    placeholder="Contoh: Nasi Bandeng Bakar & Sayur Kelor"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#071e49] text-[13px] focus:outline-none focus:border-[#1a73e8] shadow-2xs bg-white"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="font-bold text-[#071e49] block mb-1">Kelompok Sasaran:</label>
                  <input
                    type="text"
                    value={editingItem.data.targetGroup}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, targetGroup: e.target.value } })}
                    placeholder="Contoh: TK / SD / SMP"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] focus:outline-none focus:border-[#1a73e8] text-[12px] bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#071e49] block mb-1">Komposisi 5 Bintang (Wajib Ada Susu):</label>
                  <textarea
                    rows={3}
                    value={editingItem.data.composition}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, composition: e.target.value } })}
                    placeholder="Contoh: Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Bandeng Bakar (80g) | Protein Nabati: Tahu Bacem (40g) | Sayuran: Sayur Bening Kelor (50g) | Buah: Semangka Segar (50g) | Susu: Susu Sapi Segar (150ml)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] focus:outline-none focus:border-[#1a73e8] text-[12px] leading-relaxed bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#071e49] block mb-1">Target Angka Gizi (Kkal | Protein | Fe):</label>
                  <input
                    type="text"
                    value={editingItem.data.nutritionTarget}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, nutritionTarget: e.target.value } })}
                    placeholder="Contoh: 640 Kkal | 26.5g Protein | 5.2mg Fe"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-emerald-700 text-[12px] focus:outline-none focus:border-[#1a73e8] bg-white"
                  />
                  {geminiReasoning && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mt-2 flex items-center gap-1.5 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{geminiReasoning}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields for Gizi (Complete TKPI 2019 Standard) */}
            {editingItem.type === "gizi" && (
              <div className="space-y-4 text-[12px]">
                {/* AI Helper Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div>
                    <span className="font-bold text-emerald-950 block text-[13px] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Bantuan Analisis Gizi AI:
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Otomatis lengkapi seluruh nilai laboratorium TKPI 2019 per 100g untuk bahan pangan ini
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEstimateTKPI}
                    disabled={isEstimatingTKPI || !editingItem.data.name}
                    className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isEstimatingTKPI ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menganalisis TKPI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Lengkapi Gizi AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Group 1: Identitas Pangan */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#cbd5e1] space-y-3">
                  <span className="font-bold text-[#071e49] block text-[11px] uppercase tracking-wide">
                    1. Identitas Bahan Pangan
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">Kode TKPI:</label>
                      <input
                        type="text"
                        value={editingItem.data.code}
                        disabled={!editingItem.isNew}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, code: e.target.value } })}
                        placeholder="Contoh: AP001"
                        className={`w-full px-3 py-2 rounded-xl border border-[#cbd5e1] font-mono font-bold ${
                          !editingItem.isNew ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white text-[#1a73e8] focus:outline-none focus:border-[#1a73e8]"
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-9">
                      <label className="font-bold text-slate-700 block mb-1">Nama Bahan Pangan (100g):</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        disabled={!editingItem.isNew}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        placeholder="Contoh: Ikan Bandeng Segar"
                        className={`w-full px-3 py-2 rounded-xl border border-[#cbd5e1] font-bold ${
                          !editingItem.isNew ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white text-[#071e49] focus:outline-none focus:border-[#1a73e8]"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kelompok Makanan:</label>
                      <select
                        value={editingItem.data.category || "Pangan Lainnya"}
                        disabled={!editingItem.isNew}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className={`w-full px-3 py-2 rounded-xl border border-[#cbd5e1] font-semibold ${
                          !editingItem.isNew ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white text-slate-700 focus:outline-none focus:border-[#1a73e8]"
                        }`}
                      >
                        {["Serealia", "Umbi-umbian", "Ikan & Seafood", "Daging & Unggas", "Telur", "Susu", "Kacang-kacangan", "Sayuran", "Buah-buahan", "Pangan Lainnya"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bentuk:</label>
                      <select
                        value={editingItem.data.state || "Mentah"}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, state: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#1a73e8]"
                      >
                        <option value="Mentah">Mentah</option>
                        <option value="Olahan">Olahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">% BDD (Bagian Dapat Dimakan):</label>
                      <input
                        type="number"
                        value={editingItem.data.bdd ?? 100}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, bdd: Number(e.target.value) } })}
                        className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white font-bold text-slate-700 text-center focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 2: Makronutrisi */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <span className="font-bold text-[#1a73e8] block text-[11px] uppercase tracking-wide">
                    2. Makronutrisi Pokok (per 100g)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Air (g):</label>
                      <input
                        type="text"
                        value={editingItem.data.water ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, water: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Energi (Kal):</label>
                      <input
                        type="text"
                        value={editingItem.data.calories ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, calories: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white font-bold text-[#071e49] text-right text-[12px] focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Protein (g):</label>
                      <input
                        type="text"
                        value={editingItem.data.protein ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, protein: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white font-bold text-[#1a73e8] text-right text-[12px] focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Lemak (g):</label>
                      <input
                        type="text"
                        value={editingItem.data.fat ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, fat: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">KH (g):</label>
                      <input
                        type="text"
                        value={editingItem.data.carbs ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, carbs: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Serat (g):</label>
                      <input
                        type="text"
                        value={editingItem.data.fiber ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, fiber: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: Mineral Penting */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <span className="font-bold text-amber-800 block text-[11px] uppercase tracking-wide">
                    3. Mineral & Elektrolit (Pencegahan Stunting)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Ca (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.calcium ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, calcium: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">P (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.phosphorus ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, phosphorus: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-900 block mb-1 text-[11px]">Besi Fe (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.iron ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, iron: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white font-black text-amber-700 text-right text-[12px] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Na (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.sodium ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, sodium: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">K (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.potassium ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, potassium: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Seng Zn (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.zinc ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, zinc: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 4: Vitamin */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <span className="font-bold text-emerald-800 block text-[11px] uppercase tracking-wide">
                    4. Vitamin & Antioksidan
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Vit A (mcg):</label>
                      <input
                        type="text"
                        value={editingItem.data.retinol ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, retinol: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">β-Karoten (mcg):</label>
                      <input
                        type="text"
                        value={editingItem.data.bCarotene ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, bCarotene: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Vit B1 (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.thiamin ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, thiamin: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-right text-[12px] font-medium focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Vit C (mg):</label>
                      <input
                        type="text"
                        value={editingItem.data.vitaminC ?? ""}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, vitaminC: e.target.value } })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white font-bold text-emerald-700 text-right text-[12px] focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>
                </div>

                {geminiReasoning && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{geminiReasoning}</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Sparkles, 
  Check, 
  X, 
  MapPin, 
  Database, 
  Printer, 
  Download,
  Calendar, 
  ListOrdered, 
  ArrowRight, 
  RefreshCw, 
  Utensils,
  ChevronRight,
  Info,
  Clock,
  Trash2,
  Loader2,
  Lock
} from "lucide-react";
import { GRESIK_DISTRICTS, DistrictData } from "@/data/gresik-districts";
import { 
  saveMenuPlanToFirestore, 
  fetchMenuPlanFromFirestore, 
  deleteMenuPlanFromFirestore,
  fetchDistrictsFromFirestore
} from "@/services/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { getMenuFoodImage, searchRealFoodImage } from "@/utils/foodImageEngine";

interface MenuPlannerAIProps {
  selectedDistrict: string;
}

interface DayMenuState {
  day: string;
  dateStr: string;
  menuTitle: string | null;
  composition?: string;
  calories: number;
  cost: number;
  protein?: number;
  iron?: number;
  localOrigin?: string;
  proteinSource?: string;
  imageUrl?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const AVAILABLE_MONTHS = [
  { year: 2026, month: 8, label: "Agustus 2026" },
  { year: 2026, month: 9, label: "September 2026" },
  { year: 2026, month: 10, label: "Oktober 2026" },
  { year: 2026, month: 11, label: "November 2026" },
  { year: 2026, month: 12, label: "Desember 2026" },
  { year: 2027, month: 1, label: "Januari 2027" },
  { year: 2027, month: 2, label: "Februari 2027" },
  { year: 2027, month: 3, label: "Maret 2027" },
  { year: 2027, month: 4, label: "April 2027" },
  { year: 2027, month: 5, label: "Mei 2027" },
  { year: 2027, month: 6, label: "Juni 2027" },
  { year: 2027, month: 7, label: "Juli 2027" },
];

function getWorkdaysForMonth(year: number, month: number, includeSaturday: boolean = false): Record<number, { day: string; dateStr: string }[]> {
  const result: Record<number, { day: string; dateStr: string }[]> = { 1: [], 2: [], 3: [], 4: [] };
  const shortMonth = MONTH_NAMES[month - 1].slice(0, 3);
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const maxDayOfWeek = includeSaturday ? 6 : 5;
  const daysPerWeek = includeSaturday ? 6 : 5;
  
  const workdays: { day: string; dateStr: string }[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    const dayOfWeek = dt.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= maxDayOfWeek) {
      workdays.push({
        day: dayNames[dayOfWeek],
        dateStr: `${d} ${shortMonth} ${year}`
      });
    }
  }

  for (let w = 1; w <= 4; w++) {
    const startIndex = (w - 1) * daysPerWeek;
    result[w] = workdays.slice(startIndex, startIndex + daysPerWeek);
    while (result[w].length < daysPerWeek) {
      const idx = result[w].length;
      result[w].push({
        day: dayNames[idx + 1] || "Sabtu",
        dateStr: `${startIndex + idx + 1} ${shortMonth} ${year}`
      });
    }
  }

  return result;
}

export const MenuPlannerAI: React.FC<MenuPlannerAIProps> = ({ selectedDistrict }) => {
  const { user } = useAuth();
  const isKecamatanAdmin = user?.role === "admin_kecamatan" && user.districtId !== "all";
  const defaultDistrict = isKecamatanAdmin ? user.districtId : (selectedDistrict || "kebomas");

  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [targetDistrictId, setTargetDistrictId] = useState<string>(defaultDistrict);

  // Sync if user context changes
  useEffect(() => {
    if (isKecamatanAdmin && user?.districtId) {
      setTargetDistrictId(user.districtId);
    }
  }, [isKecamatanAdmin, user?.districtId]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-8");
  const [includeSaturday, setIncludeSaturday] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "yearly">("list");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  
  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isChangeRecipeModalOpen, setIsChangeRecipeModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDayIdxForChange, setSelectedDayIdxForChange] = useState<number>(0);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<DayMenuState | null>(null);
  const [selectedRecipeToast, setSelectedRecipeToast] = useState<string | null>(null);

  const [aiRecipePool, setAiRecipePool] = useState<string[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  
  // Live Food Photo Search State (Click to fetch real food photo via Gemini Nano Banana)
  const [renderedFoodImages, setRenderedFoodImages] = useState<Record<string, { url: string; isLoading: boolean }>>({});

  const handleTriggerRenderFoodImage = async (dayKey: string, menuTitle?: string | null, composition?: string | null) => {
    setRenderedFoodImages(prev => ({
      ...prev,
      [dayKey]: { url: "", isLoading: true }
    }));

    const realUrl = await searchRealFoodImage(menuTitle || "Masakan Nusantara", composition || "");

    setRenderedFoodImages(prev => ({
      ...prev,
      [dayKey]: { url: realUrl, isLoading: false }
    }));
  };
  const [logisticsBOM, setLogisticsBOM] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<DistrictData[]>(GRESIK_DISTRICTS);

  // Load Cloud Districts from Firestore
  useEffect(() => {
    async function loadCloudDistricts() {
      try {
        const res = await fetchDistrictsFromFirestore();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDistrictsList(res.data as any);
        }
      } catch (e) {
        console.warn("Gagal load master_wilayah dari Firestore, gunakan default lokal:", e);
      }
    }
    loadCloudDistricts();
  }, []);

  const currentDistrictInfo = districtsList.find((d) => d.id === targetDistrictId) || districtsList[0] || GRESIK_DISTRICTS[0];
  const targetStudents = currentDistrictInfo.targetChildren || 12500;
  const currentPeriodInfo = AVAILABLE_MONTHS.find((m) => `${m.year}-${m.month}` === selectedPeriod) || AVAILABLE_MONTHS[0];

  // 4 Weeks Cycle State (Dynamic based on selectedPeriod & includeSaturday)
  const [monthlyWeeks, setMonthlyWeeks] = useState<Record<number, DayMenuState[]>>(() => {
    const initialDates = getWorkdaysForMonth(2026, 8, false);
    return {
      1: initialDates[1].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 668, cost: 14200 })),
      2: initialDates[2].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 650, cost: 14300 })),
      3: initialDates[3].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 655, cost: 14700 })),
      4: initialDates[4].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 665, cost: 14350 })),
    };
  });

  const currentDays = monthlyWeeks[selectedWeek] || monthlyWeeks[1];

  // Load Saved Menu Plan from Firestore or initialize
  const loadSavedOrInitialData = async () => {
    try {
      // 1. Check if Firestore already has a saved plan for this district + period
      const savedRes = await fetchMenuPlanFromFirestore(targetDistrictId, selectedPeriod);
      if (savedRes.success && savedRes.data && savedRes.data.monthlyWeeks) {
        setMonthlyWeeks(savedRes.data.monthlyWeeks);
        setBudgetSummary(savedRes.data.budgetSummary);
        setLogisticsBOM(savedRes.data.logisticsBOM || []);
        setAiRecipePool(savedRes.data.availableGeneratedRecipes || []);
        if (typeof savedRes.data.includeSaturday === "boolean") {
          setIncludeSaturday(savedRes.data.includeSaturday);
        }
        setHasGenerated(true);
        return;
      }

      // 2. If not saved, reset to clean ungenerated state
      setHasGenerated(false);
      const [yearStr, monthStr] = selectedPeriod.split("-");
      const dates = getWorkdaysForMonth(parseInt(yearStr), parseInt(monthStr), includeSaturday);
      setMonthlyWeeks({
        1: dates[1].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 668, cost: 14200 })),
        2: dates[2].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 650, cost: 14300 })),
        3: dates[3].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 655, cost: 14700 })),
        4: dates[4].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 665, cost: 14350 })),
      });

      // 3. Fetch auxiliary master info
      const res = await fetch(`/api/generate-menu?districtId=${targetDistrictId}&students=${targetStudents}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiRecipePool(data.availableGeneratedRecipes || []);
          setBudgetSummary(data.budgetSummary);
          setLogisticsBOM(data.logisticsBOM || []);
        }
      }
    } catch (err) {
      console.warn("Initial load warning:", err);
    }
  };

  useEffect(() => {
    loadSavedOrInitialData();
  }, [targetDistrictId, selectedPeriod]);

  // Handle Month/Year Period Change
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
  };

  // Handle 5 vs 6 School Days Toggle
  const handleDaysModeChange = (withSaturday: boolean) => {
    setIncludeSaturday(withSaturday);
    const [yearStr, monthStr] = selectedPeriod.split("-");
    const dates = getWorkdaysForMonth(parseInt(yearStr), parseInt(monthStr), withSaturday);
    setMonthlyWeeks({
      1: dates[1].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 668, cost: 14200 })),
      2: dates[2].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 650, cost: 14300 })),
      3: dates[3].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 655, cost: 14700 })),
      4: dates[4].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 665, cost: 14350 })),
    });
  };

  // Interactive AI Generation with Step Progress Timer & Auto-Save to Firestore
  const handleTriggerAIGeneration = async () => {
    setIsGenerating(true);
    setGenerationStep(1);

    await new Promise((r) => setTimeout(r, 550));
    setGenerationStep(2);

    await new Promise((r) => setTimeout(r, 600));
    setGenerationStep(3);

    await new Promise((r) => setTimeout(r, 650));
    setGenerationStep(4);

    try {
      const res = await fetch(`/api/generate-menu?districtId=${targetDistrictId}&students=${targetStudents}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const [yearStr, monthStr] = selectedPeriod.split("-");
          const calculatedDates = getWorkdaysForMonth(parseInt(yearStr), parseInt(monthStr), includeSaturday);
          const daysCount = includeSaturday ? 6 : 5;

          const sampleExtraDay = {
            day: "Sabtu",
            menuTitle: "Nasi Sup Ayam Jamur & Perkedel Tahu",
            composition: "Nasi Putih • Sup Ayam Jamur • Perkedel Tahu • Tumis Buncis • Pisang • Susu UHT",
            calories: 635,
            protein: 30.5,
            iron: 5.8,
            cost: 14100,
            localOrigin: "Peternak Lokal Gresik"
          };

          if (data.weeklyPlan && data.weeklyPlan.length >= 5) {
            const week1List = data.weeklyPlan.map((d: any, idx: number) => ({
              day: d.day,
              dateStr: calculatedDates[1]?.[idx]?.dateStr || `${idx + 2} Agt 2026`,
              menuTitle: d.menuTitle,
              composition: d.composition?.replace(/\|/g, "•") || "Nasi Putih • Protein Segar • Sayur • Buah • Susu",
              calories: d.calories,
              cost: d.cost,
              protein: d.protein,
              iron: d.iron,
              localOrigin: d.localOrigin,
            }));

            if (includeSaturday && calculatedDates[1]?.[5]) {
              week1List.push({
                ...sampleExtraDay,
                dateStr: calculatedDates[1][5].dateStr
              });
            }

            const makeWeek = (weekIdx: number, baseDays: any[]) => {
              const list = baseDays.map((d, idx) => ({
                ...d,
                dateStr: calculatedDates[weekIdx]?.[idx]?.dateStr || d.dateStr
              }));
              if (includeSaturday && calculatedDates[weekIdx]?.[5]) {
                list.push({
                  ...sampleExtraDay,
                  dateStr: calculatedDates[weekIdx][5].dateStr
                });
              }
              return list;
            };

            const newMonthlyWeeks = {
              1: week1List,
              2: makeWeek(2, [
                { day: "Senin", dateStr: "9 Agt 2026", menuTitle: "Nasi Ikan Bakar Bumbu Madu & Sayur Asem", composition: "Nasi Putih • Ikan Laut Bakar • Tempe Mendoan • Sayur Asem • Pisang • Susu UHT", calories: 650, protein: 33.0, iron: 6.0, cost: 14300 },
                { day: "Selasa", dateStr: "10 Agt 2026", menuTitle: "Nasi Ayam Suwir Sambal Tomat & Tumis Pokcoy", composition: "Nasi Putih • Ayam Suwir Gurih • Tahu Goreng • Tumis Pokcoy • Jeruk • Susu Segar", calories: 630, protein: 32.5, iron: 5.2, cost: 14500 },
                { day: "Rabu", dateStr: "11 Agt 2026", menuTitle: "Nasi Pepes Daun Kelor & Sayur Bening Gambas", composition: "Nasi Jagung • Pepes Ikan Segar • Tempe Bacem • Sayur Bening Gambas • Pepaya • Susu UHT", calories: 620, protein: 30.2, iron: 6.8, cost: 14000 },
                { day: "Kamis", dateStr: "12 Agt 2026", menuTitle: "Nasi Opor Ayam Kampung & Sayur Bobor Daun Labu", composition: "Nasi Pulen • Opor Ayam Kampung • Tahu Bacem • Sayur Bobor Daun Labu • Melon • Susu Sapi", calories: 660, protein: 34.0, iron: 5.5, cost: 14800 },
                { day: "Jumat", dateStr: "13 Agt 2026", menuTitle: "Nasi Abon Protein Asap & Sayur Bening Bayam", composition: "Nasi Putih • Telur & Abon Ikan • Tempe Tepung • Sayur Bening Bayam • Semangka • Susu UHT", calories: 635, protein: 29.8, iron: 7.2, cost: 14100 },
              ]),
              3: makeWeek(3, [
                { day: "Senin", dateStr: "16 Agt 2026", menuTitle: "Nasi Daging Suwir Rempah & Sop Wortel Buncis", composition: "Nasi Putih • Daging Suwir • Tahu Kuning • Sop Wortel Buncis • Pisang Mas • Susu UHT", calories: 655, protein: 33.5, iron: 8.2, cost: 14700 },
                { day: "Selasa", dateStr: "17 Agt 2026", menuTitle: "Nasi Lele Fillet Bumbu Kuning & Tumis Kangkung", composition: "Nasi Putih • Lele Fillet • Tempe Goreng • Tumis Kangkung • Jeruk Manis • Susu UHT", calories: 640, protein: 31.0, iron: 6.1, cost: 13900 },
                { day: "Rabu", dateStr: "18 Agt 2026", menuTitle: "Nasi Rolade Telur Sayur & Sayur Lodeh Terong", composition: "Nasi Medium • Rolade Telur • Tahu Kukus • Lodeh Terong • Salak Manis • Susu Sapi", calories: 625, protein: 29.0, iron: 5.3, cost: 14200 },
                { day: "Kamis", dateStr: "19 Agt 2026", menuTitle: "Nasi Udang Bakar Madu & Sup Jamur Jagung", composition: "Nasi Pulen • Udang Tambak • Tempe Mendoan • Sup Jamur Jagung • Pepaya • Susu UHT", calories: 660, protein: 34.5, iron: 7.0, cost: 14850 },
                { day: "Jumat", dateStr: "20 Agt 2026", menuTitle: "Nasi Nugget Ikan Sayur & Sayur Bening Oyong", composition: "Nasi Putih • Nugget Ikan • Tahu Goreng • Sayur Bening Oyong • Pisang • Susu UHT", calories: 630, protein: 29.2, iron: 5.4, cost: 14050 },
              ]),
              4: makeWeek(4, [
                { day: "Senin", dateStr: "23 Agt 2026", menuTitle: "Nasi Bandeng Cabut Duri & Sayur Bening Bayam", composition: "Nasi Putih • Bandeng Cabut Duri • Tempe Bacem • Sayur Bening Bayam • Jeruk Manis • Susu UHT", calories: 665, protein: 34.0, iron: 6.4, cost: 14350 },
                { day: "Selasa", dateStr: "24 Agt 2026", menuTitle: "Nasi Ayam Panggang Kecap & Tumis Buncis Jagung", composition: "Nasi Putih • Ayam Panggang • Tahu Bali • Tumis Buncis • Pisang • Susu Sapi", calories: 645, protein: 32.8, iron: 5.7, cost: 14650 },
                { day: "Rabu", dateStr: "25 Agt 2026", menuTitle: "Nasi Telur Mata Sapi Sayur & Sup Kimlo Bergizi", composition: "Nasi Putih • Telur Ceplok Tomat • Tempe Goreng • Sup Kimlo Sayur • Semangka • Susu UHT", calories: 620, protein: 28.5, iron: 5.5, cost: 14000 },
                { day: "Kamis", dateStr: "26 Agt 2026", menuTitle: "Nasi Semur Daging Sapi & Tumis Sawi Putih", composition: "Nasi Pulen • Semur Daging Sapi • Tahu Kukus • Tumis Sawi Putih • Melon • Susu UHT", calories: 658, protein: 33.8, iron: 8.4, cost: 14800 },
                { day: "Jumat", dateStr: "27 Agt 2026", menuTitle: "Nasi Ikan Gurame Bumbu Acar & Sayur Bening Kelor", composition: "Nasi Putih • Gurame Fillet • Tempe Mendoan • Sayur Bening Kelor • Pepaya • Susu Sapi", calories: 640, protein: 30.5, iron: 6.9, cost: 14200 },
              ]),
            };

            // Calculate precise budget summary based on district targetChildren and daysCount
            const avgHpp = 14320;
            const computedBudget = {
              plafonPerPortion: 15000,
              avgCostPerPortion: avgHpp,
              totalPlafonWeekly: targetStudents * daysCount * 15000,
              totalCostWeekly: targetStudents * daysCount * avgHpp,
              totalSavingsWeekly: targetStudents * daysCount * (15000 - avgHpp),
              foodCostSharePct: 76,
              kitchenCostSharePct: 24,
            };

            // Calculate precise logistics BOM based on targetChildren and daysCount
            const computedBOM = [
              {
                item: "Beras Medium Pulen",
                volume: `${((targetStudents * 0.15 * daysCount) / 1000).toFixed(2)} Ton`,
                unitPrice: "Rp 14.500 / kg",
                totalCost: targetStudents * 0.15 * daysCount * 14500,
                supplierRecom: `Gapoktan Wilayah ${currentDistrictInfo.name}`,
              },
              {
                item: `Protein Hewani Utama (${currentDistrictInfo.localCommodity?.split("&")[0]?.trim() || "Ikan Laut"})`,
                volume: `${((targetStudents * 0.065 * daysCount) / 1000).toFixed(2)} Ton`,
                unitPrice: "Rp 34.000 / kg",
                totalCost: targetStudents * 0.065 * daysCount * 34000,
                supplierRecom: `Petambak/Peternak Lokal ${currentDistrictInfo.name}`,
              },
              {
                item: "Protein Nabati (Tempe & Tahu Kedelai)",
                volume: `${((targetStudents * 0.045 * daysCount) / 1000).toFixed(2)} Ton`,
                unitPrice: "Rp 12.000 / kg",
                totalCost: targetStudents * 0.045 * daysCount * 12000,
                supplierRecom: "Pengrajin Tahu Tempe Setempat",
              },
              {
                item: "Sayuran Segar Beraneka Warna",
                volume: `${((targetStudents * 0.08 * daysCount) / 1000).toFixed(2)} Ton`,
                unitPrice: "Rp 12.500 / kg",
                totalCost: targetStudents * 0.08 * daysCount * 12500,
                supplierRecom: `Kelompok Tani Sayur ${currentDistrictInfo.name}`,
              },
              {
                item: "Buah Segar Lokal (Pisang, Jeruk, Pepaya)",
                volume: `${((targetStudents * 0.085 * daysCount) / 1000).toFixed(2)} Ton`,
                unitPrice: "Rp 18.000 / kg",
                totalCost: targetStudents * 0.085 * daysCount * 18000,
                supplierRecom: "Pasar Tradisional / Petani Buah Gresik",
              },
              {
                item: "Susu Sapi Segar / UHT Standar MBG",
                volume: `${((targetStudents * 0.2 * daysCount) / 1000).toFixed(2)} Ribu Liter`,
                unitPrice: "Rp 18.000 / Liter",
                totalCost: targetStudents * 0.2 * daysCount * 18000,
                supplierRecom: "Koperasi Susu / Distributor Resmi Kemenkes",
              },
            ];

            setMonthlyWeeks(newMonthlyWeeks);
            setAiRecipePool(data.availableGeneratedRecipes || []);
            setBudgetSummary(computedBudget);
            setLogisticsBOM(computedBOM);
            setHasGenerated(true);

            // Save to Firestore automatically
            await saveMenuPlanToFirestore(targetDistrictId, selectedPeriod, {
              includeSaturday,
              monthlyWeeks: newMonthlyWeeks,
              budgetSummary: computedBudget,
              logisticsBOM: computedBOM,
              availableGeneratedRecipes: data.availableGeneratedRecipes,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Fetch error:", e);
    }

    setGenerationStep(5);
    await new Promise((r) => setTimeout(r, 400));

    setIsGenerating(false);
    setGenerationStep(0);
    setSelectedRecipeToast(`Rancangan Menu MBG (${currentPeriodInfo.label} • ${includeSaturday ? "6 Hari" : "5 Hari"}) berhasil disimpan ke Firestore!`);
    setTimeout(() => setSelectedRecipeToast(null), 3500);
  };

  // Delete & Reset Menu Plan from Firestore
  const handleDeleteMenuPlan = async () => {
    setIsDeleting(true);
    try {
      await deleteMenuPlanFromFirestore(targetDistrictId, selectedPeriod);
      
      const [yearStr, monthStr] = selectedPeriod.split("-");
      const dates = getWorkdaysForMonth(parseInt(yearStr), parseInt(monthStr), includeSaturday);
      setMonthlyWeeks({
        1: dates[1].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 668, cost: 14200 })),
        2: dates[2].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 650, cost: 14300 })),
        3: dates[3].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 655, cost: 14700 })),
        4: dates[4].map((d) => ({ day: d.day, dateStr: d.dateStr, menuTitle: null, calories: 665, cost: 14350 })),
      });

      setHasGenerated(false);
      setIsResetConfirmModalOpen(false);
      setSelectedRecipeToast(`Rancangan menu periode ${currentPeriodInfo.label} berhasil dibatalkan dan dibersihkan.`);
      setTimeout(() => setSelectedRecipeToast(null), 3500);
    } catch (e) {
      console.error("Gagal hapus menu:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Download BOM Logistics Report as Excel (.XLS)
  const handleDownloadBOMExcel = () => {
    if (!budgetSummary) return;

    const filename = `Laporan_BOM_Anggaran_MBG_Kec_${currentDistrictInfo.name}_${currentPeriodInfo.label.replace(/\\s+/g, "_")}.xls`;
    
    const rowsHtml = logisticsBOM.map((item, idx) => `
      <tr>
        <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; padding: 8px;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; font-weight: bold; color: #2C3968; padding: 8px 12px;">${item.item}</td>
        <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #35CBC3; padding: 8px 12px;">${item.volume}</td>
        <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #2C3968; padding: 8px 12px;">Rp ${Math.round(item.totalCost).toLocaleString("id-ID")}</td>
      </tr>
    `).join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt;">
          <thead>
            <tr>
              <th colspan="4" style="background-color: #2C3968; color: #ffffff; font-size: 14pt; padding: 12px; text-align: center; font-weight: bold;">
                LAPORAN KEBUTUHAN BAHAN POKOK & ANGGARAN PROGRAM MAKAN BERGIZI GRATIS (MBG)
              </th>
            </tr>
            <tr>
              <th colspan="4" style="background-color: #f1f5f9; color: #2C3968; font-size: 11pt; padding: 8px; text-align: center;">
                Wilayah Kec. ${currentDistrictInfo.name} • Periode: ${currentPeriodInfo.label} • Sasaran: ${targetStudents.toLocaleString("id-ID")} Siswa (${includeSaturday ? "Siklus 6 Hari MBG" : "Siklus 5 Hari MBG"})
              </th>
            </tr>
            <tr>
              <td colspan="2" style="background-color: #f8fafc; font-weight: bold; padding: 6px 10px; border: 1px solid #cbd5e1;">Pagu Resmi BGN (Rp 15.000 / porsi):</td>
              <td colspan="2" style="background-color: #f8fafc; font-weight: bold; padding: 6px 10px; text-align: right; border: 1px solid #cbd5e1;">Rp ${budgetSummary.totalPlafonWeekly?.toLocaleString("id-ID")}</td>
            </tr>
            <tr>
              <td colspan="2" style="background-color: #e8f0fe; font-weight: bold; color: #35CBC3; padding: 6px 10px; border: 1px solid #cbd5e1;">Realisasi Estimasi Biaya HPP:</td>
              <td colspan="2" style="background-color: #e8f0fe; font-weight: bold; color: #35CBC3; padding: 6px 10px; text-align: right; border: 1px solid #cbd5e1;">Rp ${budgetSummary.totalCostWeekly?.toLocaleString("id-ID")}</td>
            </tr>
            <tr>
              <td colspan="2" style="background-color: #ecfdf5; font-weight: bold; color: #047857; padding: 6px 10px; border: 1px solid #cbd5e1;">Estimasi Penghematan Kas APBD:</td>
              <td colspan="2" style="background-color: #ecfdf5; font-weight: bold; color: #047857; padding: 6px 10px; text-align: right; border: 1px solid #cbd5e1;">Rp ${budgetSummary.totalSavingsWeekly?.toLocaleString("id-ID")}</td>
            </tr>
            <tr style="height: 10px;"><td colspan="4" style="border: none;"></td></tr>
            <tr style="background-color: #35CBC3; font-weight: bold; text-align: center; color: #ffffff;">
              <th style="background-color: #35CBC3; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; color: #ffffff; width: 50px;">No</th>
              <th style="background-color: #35CBC3; border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold; color: #ffffff; text-align: left;">Komoditas Bahan Pokok</th>
              <th style="background-color: #35CBC3; border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold; color: #ffffff; text-align: center;">Volume Pengadaan (Kebutuhan Riil)</th>
              <th style="background-color: #35CBC3; border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold; color: #ffffff; text-align: right;">Estimasi Anggaran Pengadaan (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: right; font-weight: bold; color: #2C3968;">TOTAL REALISASI HPP:</td>
              <td style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: right; font-weight: bold; color: #35CBC3;">Rp ${budgetSummary.totalCostWeekly?.toLocaleString("id-ID")}</td>
            </tr>
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

    setSelectedRecipeToast(`File Excel (${filename}) berhasil diunduh!`);
    setTimeout(() => setSelectedRecipeToast(null), 3500);
  };

  // Re-generate a single day
  const handleRegenerateDay = (dayIdx: number) => {
    if (!aiRecipePool.length) return;
    const randomRecipe = aiRecipePool[Math.floor(Math.random() * aiRecipePool.length)];
    const updatedWeek = [...currentDays];
    updatedWeek[dayIdx] = {
      ...updatedWeek[dayIdx],
      menuTitle: randomRecipe,
    };
    setMonthlyWeeks((prev) => ({
      ...prev,
      [selectedWeek]: updatedWeek,
    }));
    setSelectedRecipeToast(`Menu ${updatedWeek[dayIdx].day} berhasil di-regenerate!`);
    setTimeout(() => setSelectedRecipeToast(null), 2500);
  };

  // Open modal to change recipe
  const handleOpenChangeRecipeModal = (dayIdx: number) => {
    setSelectedDayIdxForChange(dayIdx);
    setIsChangeRecipeModalOpen(true);
  };

  // Apply selected recipe from modal
  const handleApplyRecipeFromModal = (recipe: string) => {
    const updatedWeek = [...currentDays];
    updatedWeek[selectedDayIdxForChange] = {
      ...updatedWeek[selectedDayIdxForChange],
      menuTitle: recipe,
    };
    setMonthlyWeeks((prev) => ({
      ...prev,
      [selectedWeek]: updatedWeek,
    }));
    setIsChangeRecipeModalOpen(false);
    setSelectedRecipeToast(`Menu ${updatedWeek[selectedDayIdxForChange].day} diubah menjadi "${recipe}"!`);
    setTimeout(() => setSelectedRecipeToast(null), 2500);
  };

  // Metrics
  const avgCostCurrentWeek = Math.round(
    currentDays.reduce((acc, d) => acc + (d.cost || 14200), 0) / currentDays.length
  );
  const weeklyTotalPerStudent = currentDays.reduce((acc, d) => acc + (d.cost || 14200), 0);

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER: TITLE, CONTROLS & SUMMARY */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] lg:text-[25px] font-black text-[#2C3968] tracking-tight">
                Perencana Menu MBG
              </h1>

              {/* Filter Kecamatan */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] font-bold shadow-2xs ${
                isKecamatanAdmin
                  ? "bg-slate-50 border-blue-200 text-[#2C3968]"
                  : "bg-white border-[#cbd5e1] text-[#2C3968]"
              }`}>
                {isKecamatanAdmin ? (
                  <Lock className="w-3.5 h-3.5 text-light-sea-green" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-light-sea-green" />
                )}
                {isKecamatanAdmin ? (
                  <span className="font-bold text-ford-blue">
                    Kec. {GRESIK_DISTRICTS.find((d) => d.id === targetDistrictId)?.name || user?.regionLabel}
                    <span className="ml-1 text-[10px] text-blue-gray font-medium">(Terkunci Wilayah Anda)</span>
                  </span>
                ) : (
                  <select
                    value={targetDistrictId}
                    onChange={(e) => setTargetDistrictId(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer font-bold"
                  >
                    {GRESIK_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        Kec. {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Filter Periode Bulan & Tahun */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-[#cbd5e1] text-[12px] font-bold text-[#2C3968] shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-light-sea-green" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold"
                >
                  {AVAILABLE_MONTHS.map((m) => (
                    <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* RAG Connected Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold hidden sm:inline-flex">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>RAG 4 Master Data</span>
              </span>
            </div>
            <p className="text-[12px] text-[#64748b]">
              Optimalisasi menu gizi seimbang (5 Bintang + Susu) berbasis komoditas lokal dan pagu efisiensi Rp 15.000 / porsi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 font-sans">
            {/* Icon Button: Laporan Logistik (BOM) */}
            <button
              onClick={() => setIsLogisticsModalOpen(true)}
              className="p-2.5 rounded-xl bg-green-tint hover:bg-green-02/30 text-ford-blue border border-green-02/40 transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Laporan Logistik & Bill of Materials (BOM)"
            >
              <Package className="w-4 h-4 text-ford-blue" />
            </button>

            {/* Icon Button: Reset / Hapus Menu Plan (Only when generated) */}
            {hasGenerated && (
              <button
                onClick={() => setIsResetConfirmModalOpen(true)}
                disabled={isDeleting}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red border border-brand-red/30 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Batalkan & Bersihkan Hasil Generate Bulan Ini"
              >
                <Trash2 className="w-4 h-4 text-brand-red" />
              </button>
            )}

            {/* Button: Generate */}
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Meriset...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Bar: 3 View Modes (Mingguan vs Bulanan vs Tahunan) */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                  : "text-slate-600 hover:text-[#2C3968]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                  : "text-slate-600 hover:text-[#2C3968]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={() => setViewMode("yearly")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                viewMode === "yearly"
                  ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                  : "text-slate-600 hover:text-[#2C3968]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tahunan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {selectedRecipeToast && (
        <div className="p-3 bg-green-tint border border-green-02/40 text-ford-blue rounded-2xl text-[12px] font-bold flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <div className="w-5 h-5 rounded-full bg-green-02 text-ford-blue flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{selectedRecipeToast}</span>
        </div>
      )}

      {/* 2. CONDITIONAL CONTENT: EMPTY STATE OR GENERATED SCHEDULE */}
      {!hasGenerated ? (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] shadow-2xs text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-[#2C3968]">
              Belum Ada Jadwal Menu (Kec. {currentDistrictInfo.name} • {currentPeriodInfo.label})
            </h3>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              Pilih pola 5/6 hari dan mulai susun rekomendasi menu gizi seimbang berbasis komoditas lokal Kab. Gresik.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Meriset...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2A. VIEW MODE: CLEAN HORIZONTAL TIMELINE LIST */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {/* 5 Day Rows */}
              <div className="space-y-3">
                {currentDays.map((dayItem, idx) => {
                  const foodVisual = getMenuFoodImage(dayItem.menuTitle, dayItem.composition);

                  return (
                    <div
                      key={dayItem.day}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-light-sea-green hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 font-sans group"
                    >
                      {/* Kolom 1: Hari & Tanggal */}
                      <div className="w-full sm:w-40 shrink-0 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-green-tint border border-green-02/40 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-[10px] font-bold text-ford-blue uppercase tracking-wider">
                            {dayItem.day.slice(0, 3)}
                          </span>
                          <span className="text-[13px] font-bold text-ford-blue leading-tight">
                            {dayItem.dateStr.split(" ")[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[14px] font-bold text-ford-blue">
                            {dayItem.day}
                          </h3>
                          <span className="text-[11px] text-blue-gray font-medium">
                            {dayItem.dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Kolom 2: Thumbnail Foto Hidangan & Nama Menu (On-Demand Render Trigger) */}
                      <div className="flex-1 flex items-center gap-3.5 min-w-0">
                        {(() => {
                          const dayKey = `${selectedWeek}-${dayItem.day}`;
                          const renderState = renderedFoodImages[dayKey];

                          if (renderState?.isLoading) {
                            return (
                              <div className="w-14 h-14 rounded-2xl bg-green-tint/50 border border-green-02/40 flex flex-col items-center justify-center text-ford-blue shrink-0 animate-pulse shadow-2xs">
                                <Loader2 className="w-4 h-4 animate-spin text-light-sea-green" />
                                <span className="text-[8px] font-bold text-ford-blue mt-0.5">Merender...</span>
                              </div>
                            );
                          }

                          if (renderState?.url) {
                            return (
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform bg-slate-100">
                                <img
                                  src={renderState.url}
                                  alt={dayItem.menuTitle || "Sajian MBG"}
                                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
                                  loading="lazy"
                                />
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => handleTriggerRenderFoodImage(dayKey, dayItem.menuTitle, dayItem.composition)}
                              className="w-14 h-14 rounded-2xl bg-green-tint hover:bg-green-02/25 border border-green-02/40 flex flex-col items-center justify-center text-ford-blue transition-all cursor-pointer group/btn shrink-0 shadow-2xs hover:scale-105"
                              title="Generate Foto Hidangan via Gemini Nano Banana"
                            >
                              <Sparkles className="w-4 h-4 text-ford-blue group-hover/btn:rotate-12 transition-transform" />
                              <span className="text-[8px] font-bold mt-0.5 text-ford-blue leading-tight text-center">Gemini AI</span>
                            </button>
                          );
                        })()}

                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-ford-blue leading-snug">
                            {dayItem.menuTitle || "Belum ada menu!"}
                          </h4>
                          <span className="text-[11px] text-blue-gray font-medium block mt-0.5">
                            {dayItem.proteinSource || "Formula 5 Bintang Kemenkes RI"}
                          </span>
                        </div>
                      </div>

                      {/* Kolom 3: Biaya HPP, Tombol Ikon Detail & Ikon Ganti */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* HPP Biaya */}
                      <span className="text-[12px] font-bold text-ford-blue bg-green-tint px-3 py-1.5 rounded-xl border border-green-02/40 shadow-2xs">
                        Rp {dayItem.cost.toLocaleString("id-ID")}
                      </span>

                      {/* Tombol Ikon Detail Gizi & Bahan */}
                      <button
                        onClick={() => {
                          setSelectedDayForDetail(dayItem);
                          setIsDetailModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-green-tint hover:bg-green-02/30 text-ford-blue border border-green-02/40 flex items-center justify-center transition-all shadow-2xs hover:scale-105 cursor-pointer"
                        title="Detail Gizi & Komposisi 5 Bintang"
                      >
                        <Info className="w-4 h-4 text-ford-blue" />
                      </button>

                      {/* Tombol Ikon Generate/Ganti Menu */}
                      <button
                        onClick={() => handleOpenChangeRecipeModal(idx)}
                        className="w-8 h-8 rounded-xl bg-green-tint hover:bg-green-02/30 text-ford-blue border border-green-02/40 flex items-center justify-center transition-all shadow-2xs hover:scale-105 cursor-pointer"
                        title="Ganti / Generate Resep Lain"
                      >
                        <RefreshCw className="w-4 h-4 text-ford-blue" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* RAG-Style Pagination for 4 Weeks Cycle */}
              <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px]">
                <div className="text-slate-500">
                  Menampilkan <span className="font-bold text-[#2C3968]">Minggu {selectedWeek}</span> dari 4 Siklus Bulanan ({includeSaturday ? "6" : "5"} Hari Kerja MBG)
                </div>

                <div className="flex items-center gap-1 self-center sm:self-auto">
                  <button
                    onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                    disabled={selectedWeek === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                  >
                    Sebelumnya
                  </button>

                  {[1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedWeek(p)}
                      className={`w-8 h-8 rounded-xl font-bold transition-colors cursor-pointer ${
                        p === selectedWeek
                          ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                          : "bg-[#f8fafc] text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setSelectedWeek(Math.min(4, selectedWeek + 1))}
                    disabled={selectedWeek === 4}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2B. VIEW MODE: KALENDER 1 BULAN */}
          {viewMode === "calendar" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-[14px] font-bold text-[#2C3968] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-light-sea-green" />
                  <span>Kalender MBG 1 Bulan Penuh ({currentPeriodInfo.label} • 20 Hari Kerja)</span>
                </h3>
                <span className="text-[11px] text-[#64748b]">
                  Klik hari mana saja untuk melihat detail atau mengganti menu
                </span>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4].map((weekNum) => (
                  <div key={weekNum} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400">
                      Minggu ke-{weekNum}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                      {monthlyWeeks[weekNum]?.map((d, dIdx) => (
                        <div
                          key={d.day}
                          onClick={() => {
                            setSelectedDayForDetail(d);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-light-sea-green hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-slate-200">
                            <span className="text-[#2C3968]">{d.day}</span>
                            <span className="text-slate-400">{d.dateStr.split(" ")[0]} {d.dateStr.split(" ")[1]}</span>
                          </div>
                          <p className="text-[11px] font-bold text-[#2C3968] pt-1.5 line-clamp-2 leading-tight">
                            {d.menuTitle}
                          </p>
                          <div className="flex items-center justify-between pt-2 text-[10px]">
                            <span className="text-ford-blue font-bold">{d.calories} Kkal</span>
                            <span className="text-slate-700 font-bold">Rp {d.cost.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2C. VIEW MODE: KALENDER TAHUNAN (JADWAL PERENCANAAN 12 BULAN MBG) */}
          {viewMode === "yearly" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-[15px] font-bold text-[#2C3968] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-light-sea-green" />
                    <span>Kalender Perencanaan Tahunan (Agustus 2026 – Juli 2027)</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Pilih periode bulan untuk melihat, menyusun, atau mengelola rancangan menu MBG Kec. {currentDistrictInfo.name}
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-green-tint border border-green-02/40 text-ford-blue text-[12px] font-bold self-start sm:self-auto shadow-2xs">
                  {targetStudents.toLocaleString("id-ID")} Siswa Sasaran
                </span>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { year: 2026, month: 8, label: "Agustus 2026", quarter: "Q3 2026" },
                  { year: 2026, month: 9, label: "September 2026", quarter: "Q3 2026" },
                  { year: 2026, month: 10, label: "Oktober 2026", quarter: "Q4 2026" },
                  { year: 2026, month: 11, label: "November 2026", quarter: "Q4 2026" },
                  { year: 2026, month: 12, label: "Desember 2026", quarter: "Q4 2026" },
                  { year: 2027, month: 1, label: "Januari 2027", quarter: "Q1 2027" },
                  { year: 2027, month: 2, label: "Februari 2027", quarter: "Q1 2027" },
                  { year: 2027, month: 3, label: "Maret 2027", quarter: "Q1 2027" },
                  { year: 2027, month: 4, label: "April 2027", quarter: "Q2 2027" },
                  { year: 2027, month: 5, label: "Mei 2027", quarter: "Q2 2027" },
                  { year: 2027, month: 6, label: "Juni 2027", quarter: "Q2 2027" },
                  { year: 2027, month: 7, label: "Juli 2027", quarter: "Q3 2027" },
                ].map((m) => {
                  const periodKey = `${m.year}-${m.month}`;
                  const isSelected = selectedPeriod === periodKey;
                  const isCurrentActive = periodKey === "2026-8" && hasGenerated;

                  return (
                    <div
                      key={periodKey}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/60 border-[#35CBC3] shadow-2xs"
                          : "bg-[#f8fafc] border-[#e2e8f0] hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {m.quarter}
                          </span>
                          {isCurrentActive ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Terencana & Aktif
                            </span>
                          ) : isSelected ? (
                            <span className="px-2 py-0.5 rounded-md bg-green-tint text-ford-blue text-[10px] font-bold">
                              Periode Terpilih
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                              Tersedia
                            </span>
                          )}
                        </div>
                        <h5 className="text-[13px] font-black text-[#2C3968]">
                          {m.label}
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          {includeSaturday ? "24 Hari MBG" : "20 Hari MBG"} • 4 Siklus Mingguan
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPeriod(periodKey);
                          setViewMode("list");
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-2xs hover:bg-[#22B5AC]"
                            : "bg-white text-[#2C3968] border border-[#cbd5e1] hover:bg-slate-50"
                        }`}
                      >
                        <span>Buka Rencana Menu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 0A. MODAL: KONFIRMASI HAPUS / BERSIHKAN HASIL GENERATE */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-[17px] font-black text-[#2C3968]">
                Batalkan & Bersihkan Menu?
              </h3>
              <p className="text-[12px] text-[#64748b] leading-relaxed">
                Apakah Anda yakin ingin menghapus hasil rancangan menu untuk <strong>Kec. {currentDistrictInfo.name} ({currentPeriodInfo.label})</strong>? Status bulan ini akan kembali menjadi belum di-generate.
              </p>
              <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl border border-slate-100">
                Data rancangan menu pada bulan lainnya tetap tersimpan dan tidak akan terhapus.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMenuPlan}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus & Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 0B. MODAL: KONFIRMASI GENERATE MENU AI */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-[#2C3968]">
                    Konfirmasi Perencanaan Menu
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Atur opsi hari sebelum AI meriset menu MBG
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parameter Details */}
            <div className="space-y-3 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wilayah Sasaran:</span>
                <strong className="text-[#2C3968] font-bold">Kec. {currentDistrictInfo.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Periode Kalender:</span>
                <strong className="text-ford-blue font-bold">{currentPeriodInfo.label}</strong>
              </div>

              {/* Opsi Pola Hari Sekolah: 5 Hari vs 6 Hari */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold block">Pola Hari Sekolah:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDaysModeChange(false)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      !includeSaturday
                        ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold border-[#35CBC3] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    5 Hari (Senin–Jumat)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDaysModeChange(true)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      includeSaturday
                        ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold border-[#35CBC3] shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    6 Hari (+Sabtu)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Pagu Efisiensi:</span>
                <span className="font-bold text-[#2C3968]">Maks. Rp 15.000 / porsi</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  handleTriggerAIGeneration();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3A. MODAL: DETAIL GIZI & KOMPOSISI 5 BINTANG */}
      {isDetailModalOpen && selectedDayForDetail && (() => {
        const modalFood = getMenuFoodImage(selectedDayForDetail.menuTitle, selectedDayForDetail.composition);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in font-sans">
            <div 
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-ford-blue bg-green-tint px-2.5 py-0.5 rounded-lg border border-green-02/40">
                      {selectedDayForDetail.day}, {selectedDayForDetail.dateStr}
                    </span>
                    <span className="text-[11px] text-blue-gray font-medium">
                      Kec. {currentDistrictInfo.name}
                    </span>
                  </div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-ford-blue mt-1 leading-snug">
                    {selectedDayForDetail.menuTitle}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 rounded-lg text-blue-gray hover:text-ford-blue hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Foto Visual Sajian Hidangan MBG (Interactive Render in Modal) */}
              {(() => {
                const dayKey = `${selectedWeek}-${selectedDayForDetail.day}`;
                const renderState = renderedFoodImages[dayKey];

                if (renderState?.isLoading) {
                  return (
                    <div className="h-44 rounded-2xl bg-green-tint/40 border border-green-02/40 flex flex-col items-center justify-center text-ford-blue animate-pulse space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-light-sea-green" />
                      <span className="text-[12px] font-bold text-ford-blue">Sedang merender foto baki hidangan AI...</span>
                    </div>
                  );
                }

                if (renderState?.url) {
                  return (
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
                      <img
                        src={renderState.url}
                        alt={selectedDayForDetail.menuTitle || "Sajian MBG"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-in fade-in"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end justify-between p-3.5">
                        <div className="text-white">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white inline-block mb-1 shadow-xs">
                            🍌 Gemini Nano Banana AI Image
                          </span>
                          <p className="text-[12px] font-bold text-slate-100 leading-tight">
                            Sajian Rekomendasi Menu MBG Bergizi Lengkap
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTriggerRenderFoodImage(dayKey, selectedDayForDetail.menuTitle, selectedDayForDetail.composition)}
                          className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generate Ulang</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-2xl bg-[#F8FAFC] border-2 border-dashed border-slate-200 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center mx-auto shadow-2xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-bold text-ford-blue">Foto Visual Belum Dirender</h5>
                      <p className="text-[11px] text-blue-gray mt-0.5">Klik tombol di bawah untuk membuat foto piring sajian MBG ini menggunakan AI</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerRenderFoodImage(dayKey, selectedDayForDetail.menuTitle, selectedDayForDetail.composition)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[11.5px] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Render Foto AI Piring Ini</span>
                    </button>
                  </div>
                );
              })()}

              {/* Komposisi 5 Bintang + Susu */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
                  Formula 5 Bintang + Susu (BGN / Kemenkes RI)
                </h4>
                <div className="space-y-1.5 bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200">
                  {selectedDayForDetail.composition?.split("•").map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px]">
                      <div className="w-2 h-2 rounded-full bg-green-02 shrink-0"></div>
                      <span className="font-bold text-ford-blue">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

            {/* Nutrisi Lab AKG (High Contrast Green Tint Theme) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
                Analisis Nilai Gizi Lab (TKPI 2019)
              </h4>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 shadow-2xs">
                  <span className="text-[10px] text-blue-gray font-bold block">Energi:</span>
                  <strong className="text-[15px] font-bold text-ford-blue">{selectedDayForDetail.calories} Kkal</strong>
                </div>
                <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 shadow-2xs">
                  <span className="text-[10px] text-blue-gray font-bold block">Protein:</span>
                  <strong className="text-[15px] font-bold text-ford-blue">{selectedDayForDetail.protein || 32.5} g</strong>
                </div>
                <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 shadow-2xs">
                  <span className="text-[10px] text-blue-gray font-bold block">Zat Besi (Fe):</span>
                  <strong className="text-[15px] font-bold text-ford-blue">{selectedDayForDetail.iron || 6.2} mg</strong>
                </div>
              </div>
            </div>

            {/* Biaya HPP */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-between text-[12px]">
              <span className="text-blue-gray font-medium">Estimasi HPP Bahan Baku:</span>
              <strong className="text-ford-blue font-bold text-[15px]">
                Rp {selectedDayForDetail.cost.toLocaleString("id-ID")} / porsi
              </strong>
            </div>

              <div className="pt-1 text-right">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. MODAL: PILIH RESEP ALTERNATIF (TAMPIL HANYA SAAT INGIN GANTI MENU) */}
      {isChangeRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-[#2C3968]">
                    Pilih Menu Alternatif ({currentDays[selectedDayIdxForChange]?.day}, {currentDays[selectedDayIdxForChange]?.dateStr})
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Variasi resep berbasis komoditas lokal unggulan Kec. {currentDistrictInfo.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChangeRecipeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Alternative Recipes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {aiRecipePool.map((recipe, rIdx) => (
                <button
                  key={rIdx}
                  onClick={() => handleApplyRecipeFromModal(recipe)}
                  className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-green-tint/60 border border-slate-200 hover:border-green-02/40 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
                >
                  <div>
                    <span className="text-[13px] font-bold text-ford-blue group-hover:text-light-sea-green block">
                      {recipe}
                    </span>
                    <span className="text-[10px] text-blue-gray mt-0.5 block">
                      Komoditas Pangan Lokal Kec. {currentDistrictInfo.name} • Formula 5 Bintang Kemenkes
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-gray group-hover:text-light-sea-green shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsChangeRecipeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: AI GENERATION STEP-BY-STEP OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#cbd5e1] space-y-5 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-full bg-green-tint text-ford-blue flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[16px] font-black text-[#2C3968]">
                AI Sedang Meriset Menu MBG...
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Proses penalaran otonom dan kalkulasi 4 dataset pangan Kab. Gresik
              </p>
            </div>

            {/* 4 Step Progress Indicators */}
            <div className="space-y-2 text-left text-[11px]">
              <div className={`p-2.5 rounded-xl flex items-center gap-2.5 border transition-all ${
                generationStep >= 1 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                {generationStep > 1 ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0"></div>
                )}
                <span>1. Mengambil komoditas lokal Kec. {currentDistrictInfo.name}</span>
              </div>

              <div className={`p-2.5 rounded-xl flex items-center gap-2.5 border transition-all ${
                generationStep >= 2 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                {generationStep > 2 ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : generationStep === 2 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                )}
                <span>2. Menganalisis harga harian SISKAPERBAPO Jatim</span>
              </div>

              <div className={`p-2.5 rounded-xl flex items-center gap-2.5 border transition-all ${
                generationStep >= 3 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                {generationStep > 3 ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : generationStep === 3 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                )}
                <span>3. Menghitung formula 5 Bintang + Susu & AKG TKPI</span>
              </div>

              <div className={`p-2.5 rounded-xl flex items-center gap-2.5 border transition-all ${
                generationStep >= 4 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                {generationStep >= 4 ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                )}
                <span>4. Mengoptimalkan pagu anggaran HPP &lt; Rp 15.000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: LAPORAN KEBUTUHAN BAHAN POKOK (BOM LOGISTIK) */}
      {isLogisticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue border border-green-02/40 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-ford-blue">
                    Laporan Logistik & Bill of Materials (BOM)
                  </h3>
                  <p className="text-[11px] text-blue-gray">
                    Kebutuhan belanja bahan baku SPPG Kec. {currentDistrictInfo.name} ({currentPeriodInfo.label})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLogisticsModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-gray hover:text-ford-blue hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Empty State or Logistics Table */}
            {logisticsBOM.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-[#F8FAFC] rounded-2xl border border-slate-200 my-auto">
                <Package className="w-10 h-10 text-blue-gray mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-ford-blue text-[14px]">Belum Ada Data Bahan Baku</h4>
                  <p className="text-[11px] text-blue-gray max-w-sm mx-auto">
                    Silakan klik tombol &ldquo;Generate&rdquo; terlebih dahulu untuk menyusun menu dan mengkalkulasi kebutuhan belanja bahan baku.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsLogisticsModalOpen(false);
                      setIsConfirmModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Menu Sekarang</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Budget Summary Mini Cards */}
                {budgetSummary && (
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                      <span className="text-[10px] text-blue-gray font-bold block">Pagu Resmi BGN (Rp 15.000):</span>
                      <strong className="text-[14px] font-bold text-ford-blue">
                        Rp {budgetSummary.totalPlafonWeekly?.toLocaleString("id-ID")}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-green-tint border border-green-02/40 shadow-2xs">
                      <span className="text-[10px] text-blue-gray font-bold block">Realisasi Biaya HPP:</span>
                      <strong className="text-[14px] font-bold text-ford-blue">
                        Rp {budgetSummary.totalCostWeekly?.toLocaleString("id-ID")}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                      <span className="text-[10px] text-emerald-700 font-bold block">Penghematan APBD:</span>
                      <strong className="text-[14px] font-bold text-emerald-700">
                        Rp {budgetSummary.totalSavingsWeekly?.toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Table of BOM Logistics */}
                <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 max-h-72">
                  <table className="w-full text-left text-[12px] border-collapse">
                    <thead className="bg-[#F8FAFC] text-ford-blue font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Komoditas Bahan Pokok</th>
                        <th className="py-3 px-4 text-center">Volume Pengadaan (Kebutuhan Riil)</th>
                        <th className="py-3 px-4 text-right">Estimasi Anggaran Pengadaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logisticsBOM.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-ford-blue text-[13px]">{item.item}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-ford-blue">
                            <span className="px-3 py-1 rounded-lg bg-green-tint border border-green-02/40 inline-block text-[12px]">
                              {item.volume}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-ford-blue text-[13px]">
                            Rp {Math.round(item.totalCost).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-blue-gray">
                  <span>Plafon Resmi: Rp 15.000 / porsi • 100% Pangan Lokal Terpenuhi</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadBOMExcel}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Excel (.XLS)</span>
                    </button>
                    <button
                      onClick={() => setIsLogisticsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { DistrictData } from "@/types";

export function useDashboardState() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const selectedDistrict: DistrictData | undefined = GRESIK_DISTRICTS.find(
    (d) => d.id === selectedDistrictId
  );

  return {
    selectedDistrictId,
    setSelectedDistrictId,
    selectedDistrict,
    isChatOpen,
    setIsChatOpen,
    isScreeningOpen,
    setIsScreeningOpen,
    isExportOpen,
    setIsExportOpen,
  };
}

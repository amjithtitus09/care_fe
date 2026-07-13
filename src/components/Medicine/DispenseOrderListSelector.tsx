import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";
import { useInView } from "react-intersection-observer";

import { CardListSkeleton } from "@/components/Common/SkeletonLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DispenseOrderRead } from "@/types/emr/dispenseOrder/dispenseOrder";
import dispenseOrderApi from "@/types/emr/dispenseOrder/dispenseOrderApi";
import query from "@/Utils/request/query";
import { PaginatedResponse } from "@/Utils/request/types";
import { formatDateTime } from "@/Utils/utils";
import { ChevronDown, PackageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const DISPENSE_ORDERS_PAGE_SIZE = 14;

interface DispenseOrderListSelectorProps {
  patientId: string;
  facilityId?: string;
  selectedDispenseOrderId?: string;
  onSelectDispenseOrder: (dispenseOrder: DispenseOrderRead | undefined) => void;
}

export default function DispenseOrderListSelector({
  patientId,
  facilityId,
  selectedDispenseOrderId,
  onSelectDispenseOrder,
}: DispenseOrderListSelectorProps) {
  const { t } = useTranslation();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["dispenseOrders", patientId, facilityId],
    queryFn: async ({ pageParam = 0, signal }) => {
      const response = await query(dispenseOrderApi.list, {
        pathParams: { facilityId: facilityId ?? "" },
        queryParams: {
          patient: patientId,
          limit: DISPENSE_ORDERS_PAGE_SIZE,
          offset: String(pageParam),
        },
      })({ signal });
      return response as PaginatedResponse<DispenseOrderRead>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentOffset = allPages.length * DISPENSE_ORDERS_PAGE_SIZE;
      return currentOffset < lastPage.count ? currentOffset : null;
    },
    enabled: !!patientId && !!facilityId,
  });

  const dispenseOrders = React.useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  function handleSelectDispenseOrder(
    dispenseOrder: DispenseOrderRead | undefined,
  ) {
    onSelectDispenseOrder(dispenseOrder);
    setOpenDrawer(false);
  }

  // Select first dispense order by default
  React.useEffect(() => {
    if (dispenseOrders.length) {
      if (!selectedDispenseOrderId) {
        onSelectDispenseOrder(dispenseOrders[0]);
      }
    } else if (!isLoading) {
      onSelectDispenseOrder(undefined);
    }
  }, [dispenseOrders, selectedDispenseOrderId, onSelectDispenseOrder, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-3 w-60">
        <CardListSkeleton count={7} />
      </div>
    );
  }

  if (!dispenseOrders.length) {
    return null;
  }

  const selectedDispenseOrder = selectedDispenseOrderId
    ? dispenseOrders.find((order) => order.id === selectedDispenseOrderId)
    : undefined;

  return (
    <>
      <div className="hidden lg:block h-full overflow-y-auto pr-1">
        <DispenseOrderList
          dispenseOrders={dispenseOrders}
          selectedDispenseOrderId={selectedDispenseOrderId}
          onSelectDispenseOrder={onSelectDispenseOrder}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
      <div className="lg:hidden">
        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
          <DrawerTrigger asChild>
            {selectedDispenseOrder ? (
              <Button
                variant="outline"
                className="w-full flex justify-between items-center py-6"
              >
                <div className="flex gap-3">
                  <PackageIcon className="size-5 text-primary-600" />
                  <div className="flex flex-col -mt-1 text-left">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {selectedDispenseOrder.name ||
                        formatDateTime(
                          selectedDispenseOrder.created_date,
                          "DD/MM/YYYY hh:mm A",
                        )}
                    </span>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {t("location")}: {selectedDispenseOrder.location.name}
                    </span>
                  </div>
                </div>
                <ChevronDown className="size-5 text-gray-500 shrink-0 ml-2" />
              </Button>
            ) : (
              <Button variant="outline" className="w-full">
                {t("select_dispense_order")}
              </Button>
            )}
          </DrawerTrigger>

          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>{t("dispense_orders")}</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto pr-2">
              <DispenseOrderList
                dispenseOrders={dispenseOrders}
                selectedDispenseOrderId={selectedDispenseOrderId}
                onSelectDispenseOrder={handleSelectDispenseOrder}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

function DispenseOrderList({
  dispenseOrders,
  selectedDispenseOrderId,
  onSelectDispenseOrder,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  dispenseOrders: DispenseOrderRead[];
  selectedDispenseOrderId: string | undefined;
  onSelectDispenseOrder: (dispenseOrder: DispenseOrderRead | undefined) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-2 p-2">
      {dispenseOrders.map((dispenseOrder) => {
        const isSelected = selectedDispenseOrderId === dispenseOrder.id;
        return (
          <Card
            key={dispenseOrder.id}
            className={cn(
              "rounded-md relative cursor-pointer transition-colors w-full",
              isSelected
                ? "bg-white border-primary-600 shadow-md"
                : "bg-gray-100 hover:bg-gray-100 shadow-none",
            )}
            onClick={() => onSelectDispenseOrder(dispenseOrder)}
          >
            {isSelected && (
              <div className="absolute right-0 h-8 w-1 bg-primary-600 rounded-l inset-y-1/2 -translate-y-1/2" />
            )}
            <CardContent className="flex flex-col px-4 py-3 gap-2">
              <div className="flex gap-3">
                <PackageIcon
                  className={cn(
                    "size-5",
                    isSelected ? "text-primary-600" : "text-gray-500",
                  )}
                />
                <div className="flex flex-col -mt-1">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {dispenseOrder.name ||
                      formatDateTime(
                        dispenseOrder.created_date,
                        "DD/MM/YYYY hh:mm A",
                      )}
                  </span>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {t("location")}: {dispenseOrder.location.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <div ref={ref} />
      {isFetchingNextPage && <CardListSkeleton count={2} />}
    </div>
  );
}

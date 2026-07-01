import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListOrdered } from "lucide-react";
import { Link } from "raviger";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { resourceTypeToResourcePathSlug } from "@/components/Schedule/useScheduleResource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  getQueueTokenStatus,
  QUEUE_TOKEN_STATUS_COLORS,
  renderTokenNumber,
  TokenStatus,
} from "@/types/tokens/token/token";
import tokenApi from "@/types/tokens/token/tokenApi";

import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";

interface QueueFlowBannerProps {
  facilityId: string;
  queueId: string;
  tokenId: string;
}

export default function QueueFlowBanner({
  facilityId,
  queueId,
  tokenId,
}: QueueFlowBannerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: token } = useQuery({
    queryKey: ["token", facilityId, queueId, tokenId],
    queryFn: query(tokenApi.get, {
      pathParams: { facility_id: facilityId, queue_id: queueId, id: tokenId },
    }),
  });

  const { mutate: markAsNowServing, isPending } = useMutation({
    mutationFn: mutate(tokenApi.update, {
      pathParams: { facility_id: facilityId, queue_id: queueId, id: tokenId },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["token", facilityId, queueId, tokenId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-tokens", facilityId, queueId],
      });
      queryClient.invalidateQueries({
        queryKey: ["token-queue-summary", facilityId, queueId],
      });
      toast.success(t("updated_successfully"));
    },
  });

  if (!token) {
    return null;
  }

  const queueStatus = getQueueTokenStatus(token);
  const canMarkAsNowServing =
    token.status === TokenStatus.CREATED && !!token.sub_queue;

  const queueBoardUrl = `/facility/${facilityId}/${resourceTypeToResourcePathSlug[token.resource_type]}/${token.resource.id}/queues/${token.queue.id}`;

  return (
    <Card className="flex flex-col gap-3 border border-primary-200 bg-primary-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <ListOrdered className="size-5 shrink-0 text-primary-700" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-gray-600">
            {t("opened_from_queue")}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {renderTokenNumber(token)}
            </span>
            <Badge
              variant={QUEUE_TOKEN_STATUS_COLORS[queueStatus]}
              className="shrink-0"
            >
              {t(`token_status__${queueStatus}`)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canMarkAsNowServing && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              markAsNowServing({
                status: TokenStatus.IN_PROGRESS,
                note: token.note,
                sub_queue: token.sub_queue?.id ?? null,
              })
            }
          >
            {t("mark_as_now_serving")}
          </Button>
        )}
        <Button variant="primary" size="sm" asChild>
          <Link basePath="/" href={queueBoardUrl}>
            <ListOrdered className="mr-2 size-4" />
            {t("back_to_queue")}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

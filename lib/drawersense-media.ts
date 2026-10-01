import "server-only";

import type { LessonId } from "@/lib/drawersense-curriculum";

export type DrawerSenseMediaKind = "concept" | "solution";
export type DrawerSenseMediaFormat = "video" | "captions" | "transcript";
export type DrawerSenseMediaResource = {
  resourceKey: string;
  lessonId: LessonId;
  kind: DrawerSenseMediaKind;
  format: DrawerSenseMediaFormat;
};

const lessonIds: LessonId[] = ["2.0A", "2.0B", "2.1A", "2.1B", "2.1C", "2.1D", "2.1E", "2.1F"];

export const drawerSenseMediaResources: DrawerSenseMediaResource[] = lessonIds.flatMap((lessonId) =>
  (["concept", "solution"] as const).flatMap((kind) =>
    (["video", "captions", "transcript"] as const).map((format) => ({
      lessonId,
      kind,
      format,
      resourceKey: `drawersense-${lessonId.toLowerCase().replace(".", "-")}-${kind}-${format}`,
    })),
  ),
);

const mediaByKey = new Map(drawerSenseMediaResources.map((resource) => [resource.resourceKey, resource]));

export function getDrawerSenseMediaResource(resourceKey: string) {
  return mediaByKey.get(resourceKey) ?? null;
}

export function getDrawerSenseMediaKeys(lessonId: LessonId, kind: DrawerSenseMediaKind) {
  return Object.fromEntries(
    drawerSenseMediaResources
      .filter((resource) => resource.lessonId === lessonId && resource.kind === kind)
      .map((resource) => [resource.format, resource.resourceKey]),
  ) as Record<DrawerSenseMediaFormat, string>;
}
import { notFound } from "next/navigation";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TaskDetail } from "@/components/tasks/task-detail";
import { TaskCommentThread } from "@/components/tasks/task-comment-thread";

interface TaskDetailPageProps {
  params: { taskId: string; locale: string };
}

export default async function TaskDetailPage({
  params: { taskId },
}: TaskDetailPageProps) {
  const session = await requireFamilyAuth();
  const { familyId } = session.user;

  const task = await prisma.task.findFirst({
    where: { id: taskId, familyId, deletedAt: null },
    include: {
      property: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true, image: true } },
      contactAssignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, image: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const [properties, familyMembers] = await Promise.all([
    prisma.property.findMany({
      where: { familyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    prisma.familyMembership.findMany({
      where: { familyId, status: "ACTIVE" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={task.title} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TaskDetail
            task={task}
            properties={properties}
            members={familyMembers}
          />
          <TaskCommentThread
            taskId={task.id}
            comments={task.comments}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}

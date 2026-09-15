import { IssueBoard } from "@/components/issue-board";
import { getBoardIssues, getFamilyMembers } from "@/lib/data";

export default async function MaGjoresPage() {
  const [boardIssues, familyMembers] = await Promise.all([
    getBoardIssues(),
    getFamilyMembers(),
  ]);

  return (
    <main className="shell boardShell">
      <IssueBoard
        initialIssues={boardIssues}
        familyMembers={familyMembers.map((member) => member.name)}
      />
    </main>
  );
}

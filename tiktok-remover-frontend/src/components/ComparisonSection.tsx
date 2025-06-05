
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ComparisonSection = () => {
  return (
    <section className="py-16 bg-gray-50 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Not Manual Deletion or Other Extensions?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Compare the efficiency of different methods for removing TikTok reposts
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Time Needed for 500 Reposts</TableHead>
              <TableHead>Risk of Error</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Manual (phone)</TableCell>
              <TableCell>~2 hours tapping</TableCell>
              <TableCell>
                <Badge variant="destructive">High</Badge>
              </TableCell>
              <TableCell>Free</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Random "Cleaner" Extension</TableCell>
              <TableCell>Unknown</TableCell>
              <TableCell>
                <Badge variant="secondary">Privacy concerns</Badge>
              </TableCell>
              <TableCell>Varies</TableCell>
            </TableRow>
            <TableRow className="bg-blue-50">
              <TableCell className="font-bold">TikTok Repost Remover</TableCell>
              <TableCell className="font-semibold">~8 minutes</TableCell>
              <TableCell>
                <Badge variant="default">Low</Badge>
              </TableCell>
              <TableCell className="font-semibold">Free</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default ComparisonSection;

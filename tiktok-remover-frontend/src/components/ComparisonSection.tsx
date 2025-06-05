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
    <section className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/5 to-[#00F2EA]/5"></div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Why Not Manual Deletion or Other Extensions?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Compare the efficiency of different methods for removing TikTok reposts
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300 font-semibold">Method</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Time Needed for 500 Reposts</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Risk of Error</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-700">
                  <TableCell className="font-medium text-white">Manual (phone)</TableCell>
                  <TableCell className="text-gray-300">~2 hours tapping</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-600">High</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">Free</TableCell>
                </TableRow>
                <TableRow className="border-gray-700">
                  <TableCell className="font-medium text-white">Random "Cleaner" Extension</TableCell>
                  <TableCell className="text-gray-300">Unknown</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-yellow-600 text-white">Privacy concerns</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">Varies</TableCell>
                </TableRow>
                <TableRow className="bg-gradient-to-r from-[#FE2C55]/20 to-[#00F2EA]/20 border-[#FE2C55]/50">
                  <TableCell className="font-bold text-white">ClearTok (TikTok Repost Remover)</TableCell>
                  <TableCell className="font-semibold text-[#00F2EA]">~8 minutes</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-600">Low</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-[#FE2C55]">Free</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;

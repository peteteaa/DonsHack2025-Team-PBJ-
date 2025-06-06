// /components/TranscriptSection.tsx
"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { formatTimestamp } from "@/lib/utils";
import type { ContentTableItem } from "@shared/types";

interface TranscriptSectionProps {
	contentTable: ContentTableItem[];
}

const TranscriptSection: React.FC<TranscriptSectionProps> = ({
	contentTable,
}) => {
	return (
		<Accordion className="w-full" collapsible type="single">
			{contentTable.map((chapter) => (
				<AccordionItem key={chapter.id} value={chapter.chapter}>
					<AccordionTrigger>
						<div className="flex flex-col items-start text-left">
							<div className="font-semibold">{chapter.chapter}</div>
						</div>
					</AccordionTrigger>
					<AccordionContent className="max-h-60 overflow-y-auto">
						<div className="space-y-4">
							{chapter.transcript.map((item) => (
								<div className="flex gap-3 text-sm" key={item.text}>
									<span className="text-muted-foreground whitespace-nowrap">
										{formatTimestamp(item.start)} - {formatTimestamp(item.end)}
									</span>
									<p>{item.text}</p>
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};

export default TranscriptSection;

"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Chapter {
  chapter: string
  summary: string
  transcript: Array<{
    start: number
    end: number
    text: string
  }>
}

interface ContentCardProps {
  contentTable: Chapter[]
}

const ContentCard = ({ contentTable }: ContentCardProps) => {
  const [isNotesView, setIsNotesView] = useState(false)
  const [notes, setNotes] = useState("")

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value)
  }

  const toggleView = () => {
    setIsNotesView(!isNotesView)
  }

  return (
    <Card className="transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="group-hover:text-primary group-hover:brightness-125">Content Overview</CardTitle>
        <Button
          variant="ghost"
          onClick={toggleView}
          aria-label={isNotesView ? "View Content" : "Take Notes"}
        >
          {isNotesView ? "View Content" : "Take Notes"}
        </Button>
      </CardHeader>
      <CardContent>
        {isNotesView ? (
          <div>
            <h3 className="text-base font-semibold mb-1">Your Notes</h3>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              className="w-full h-40 p-2 border rounded bg-background mb-2"
              placeholder="Write your notes here..."
            />
            <Button variant="outline" className="w-full">
              Save Notes //ADD SAVE NOTES FUNCTIONALITY HERE
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contentTable.map((chapter, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="text-base font-semibold mb-1">{chapter.chapter}</h3>
                <p className="text-sm text-muted-foreground">{chapter.summary}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ContentCard

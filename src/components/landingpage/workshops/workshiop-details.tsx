"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  type CalculatorType,
  calculatorWorkshops,
} from "@/components/landingpage/workshops/workshops.config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function WorkshopDetails({ type }: { type: CalculatorType }) {
  const workshop = calculatorWorkshops[type];

  return (
    <>
      {/* Header */}
      <div className="space-y-4 text-center">
        <Badge variant="secondary" className="text-sm">
          {workshop.duration}
        </Badge>
        <h2 className="font-semibold text-3xl lg:text-4xl">{workshop.title}</h2>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          {workshop.description}
        </p>
      </div>

      <Separator className="my-12" />

      {/* Workshop Sections */}
      <div className="space-y-8">
        {workshop.sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-2xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.steps.map((step, stepIdx) => (
                  <AccordionItem
                    key={step.title}
                    value={`step-${section.title}-${stepIdx}`}
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                        <span className="font-medium">
                          {stepIdx + 1}. {step.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-8">
                      <div className="space-y-4">
                        <div className="whitespace-pre-line text-muted-foreground">
                          {step.content}
                        </div>
                        {step.links && step.links.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.links.map((link) => (
                              <Button
                                key={link.text}
                                asChild
                                variant="outline"
                                size="sm"
                              >
                                {link.isExternal ? (
                                  <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2"
                                  >
                                    {link.text}
                                    <ExternalLink className="size-3" />
                                  </a>
                                ) : (
                                  <Link href={link.href}>{link.text}</Link>
                                )}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="mt-12 border-primary/20">
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
          <CardDescription>
            Begin your carbon footprint calculation journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/org/dashboard">Open Greendex App</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#workshops">View All Workshops</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

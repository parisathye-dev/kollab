"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, FileUp, IndianRupee, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import { createBusinessGig } from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import { postGigSchema, type PostGigInput } from "@/lib/validation/business";
import type { ArtistSkill } from "@/types/artist";
import type { BusinessRadiusKm } from "@/types/business";
import type { WorkType } from "@/types/database";

const skillOptions: { value: ArtistSkill; label: string }[] = [
  { value: "reel_editor", label: "Reel Editor" },
  { value: "photographer", label: "Photographer" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "ui_ux", label: "UI/UX" },
  { value: "motion_designer", label: "Motion Designer" },
  { value: "copywriter", label: "Copywriter" },
  { value: "videographer", label: "Videographer" },
  { value: "illustrator", label: "Illustrator" },
];

const workTypeOptions: { value: WorkType; label: string }[] = [
  { value: "in_person", label: "In-Person Only" },
  { value: "remote", label: "Remote OK" },
  { value: "either", label: "Either" },
];

const radiusOptions: { value: BusinessRadiusKm; label: string }[] = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 25, label: "25km" },
  { value: 999, label: "Any" },
];

const stepFields: Record<number, (keyof PostGigInput)[]> = {
  1: ["skillRequired", "title", "description"],
  2: ["budgetMin", "budgetMax", "deadline", "workType"],
  3: ["locationText", "radiusKm"],
};

function defaultDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);

  return date.toISOString().slice(0, 10);
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to post gig.";
}

export function BusinessPostGigScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PostGigInput>({
    resolver: zodResolver(postGigSchema),
    defaultValues: {
      skillRequired: "reel_editor",
      title: "",
      description: "",
      budgetMin: 5000,
      budgetMax: 15000,
      deadline: defaultDeadline(),
      workType: "either",
      locationText: "Thane West",
      radiusKm: 10,
    },
    mode: "onChange",
  });
  const values = form.watch();
  const progress = useMemo(() => Math.round((step / 3) * 100), [step]);

  async function goNext() {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });

    if (valid) {
      setStep((currentStep) => Math.min(currentStep + 1, 3));
    }
  }

  async function submitGig(input: PostGigInput) {
    try {
      setIsSubmitting(true);
      const gigId = await createBusinessGig(input, files);
      toast({
        title: "Gig posted",
        description: "Your brief is live for matching creators.",
      });
      router.push(`/business/gig/${gigId}`);
    } catch (error: unknown) {
      toast({
        title: "Gig not posted",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateFiles(fileList: FileList | null) {
    setFiles(Array.from(fileList ?? []).slice(0, 3));
  }

  return (
    <BusinessShell title="Post a New Gig">
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(submitGig)}
      >
        <div>
          <p className="text-sm font-medium text-secondary">Gig Posting Wizard</p>
          <h1 className="mt-1 text-2xl font-semibold">
            Create a local creator brief
          </h1>
          <Progress value={progress} className="mt-4 h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>What you need</span>
            <span>Budget</span>
            <span>Confirm</span>
          </div>
        </div>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="space-y-5 pt-1">
            {step === 1 ? (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">What do you need?</h2>
                  <p className="text-sm text-muted-foreground">
                    Pick the core skill and write a brief creators can quote
                    against.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skill">Skill</Label>
                  <Select
                    value={values.skillRequired}
                    onValueChange={(value) =>
                      form.setValue("skillRequired", value as ArtistSkill, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      id="skill"
                      aria-label="Select required skill"
                      className="h-11 w-full"
                    >
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.skillRequired ? (
                    <p className="text-sm text-danger">
                      {form.formState.errors.skillRequired.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Gig title</Label>
                  <Input
                    id="title"
                    aria-label="Gig title"
                    placeholder="30-sec food reel for new menu"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title ? (
                    <p className="text-sm text-danger">
                      {form.formState.errors.title.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    aria-label="Gig description"
                    rows={7}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
                    placeholder="Describe deliverables, brand direction, references, and what success looks like."
                    {...form.register("description")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {values.description.length}/100 minimum characters
                  </p>
                  {form.formState.errors.description ? (
                    <p className="text-sm text-danger">
                      {form.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="references">Reference upload</Label>
                  <label
                    htmlFor="references"
                    className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#FFF8F3] px-4 py-5 text-center focus-within:ring-3 focus-within:ring-secondary/40"
                  >
                    <FileUp className="size-6 text-secondary" aria-hidden="true" />
                    <span className="mt-2 text-sm font-medium">
                      Add up to 3 files
                    </span>
                    <span className="text-xs text-muted-foreground">
                      20MB each, optional
                    </span>
                    <input
                      id="references"
                      type="file"
                      multiple
                      aria-label="Upload reference files"
                      className="sr-only"
                      onChange={(event) => updateFiles(event.target.files)}
                    />
                  </label>
                  {files.length > 0 ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {files.map((file) => (
                        <p key={`${file.name}-${file.size}`}>{file.name}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Budget & Timeline</h2>
                  <p className="text-sm text-muted-foreground">
                    Keep the quote range realistic for fast matching.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FFF8F3] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="flex items-center gap-2">
                      <IndianRupee className="size-4 text-secondary" aria-hidden="true" />
                      Budget range
                    </Label>
                    <span className="text-sm font-semibold">
                      {formatInr(values.budgetMin)} - {formatInr(values.budgetMax)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4">
                    <input
                      type="range"
                      min={500}
                      max={25000}
                      step={500}
                      aria-label="Minimum budget"
                      className="w-full accent-secondary"
                      value={values.budgetMin}
                      onChange={(event) =>
                        form.setValue("budgetMin", Number(event.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                    <input
                      type="range"
                      min={500}
                      max={25000}
                      step={500}
                      aria-label="Maximum budget"
                      className="w-full accent-secondary"
                      value={values.budgetMax}
                      onChange={(event) =>
                        form.setValue("budgetMax", Number(event.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                  {form.formState.errors.budgetMax ? (
                    <p className="mt-2 text-sm text-danger">
                      {form.formState.errors.budgetMax.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    aria-label="Deadline date"
                    {...form.register("deadline")}
                  />
                  {form.formState.errors.deadline ? (
                    <p className="text-sm text-danger">
                      {form.formState.errors.deadline.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Work type</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {workTypeOptions.map((option) => {
                      const active = values.workType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-label={`Set work type to ${option.label}`}
                          aria-pressed={active}
                          onClick={() =>
                            form.setValue("workType", option.value, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "rounded-xl border px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40",
                            active
                              ? "border-secondary bg-secondary-tint text-secondary"
                              : "border-input bg-white text-muted-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Location & Confirm</h2>
                  <p className="text-sm text-muted-foreground">
                    Set where creators should match from, then review the brief.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="location"
                      aria-label="Gig location"
                      list="location-options"
                      className="pl-9"
                      {...form.register("locationText")}
                    />
                    <datalist id="location-options">
                      <option value="Thane West" />
                      <option value="Hiranandani Estate, Thane" />
                      <option value="Bandra West, Mumbai" />
                      <option value="Powai, Mumbai" />
                      <option value="Remote" />
                    </datalist>
                  </div>
                  {form.formState.errors.locationText ? (
                    <p className="text-sm text-danger">
                      {form.formState.errors.locationText.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Geo radius</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {radiusOptions.map((option) => {
                      const active = values.radiusKm === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-label={`Set radius to ${option.label}`}
                          aria-pressed={active}
                          onClick={() =>
                            form.setValue("radiusKm", option.value, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "rounded-xl border px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40",
                            active
                              ? "border-secondary bg-secondary-tint text-secondary"
                              : "border-input bg-white text-muted-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Card className="border-0 bg-[#FFF8F3] shadow-none">
                  <CardContent className="space-y-3 pt-1 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Brief</p>
                        <p className="font-semibold">{values.title || "Untitled gig"}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                        {skillLabel(values.skillRequired)}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-muted-foreground">
                      {values.description || "Description will appear here."}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          {formatInr(values.budgetMin)} - {formatInr(values.budgetMax)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="flex items-center gap-1 font-semibold">
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          {values.deadline}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {values.locationText} ·{" "}
                      {radiusOptions.find((option) => option.value === values.radiusKm)?.label}
                    </p>
                  </CardContent>
                </Card>
              </section>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Go to previous step"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((currentStep) => Math.max(currentStep - 1, 1))}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              aria-label="Go to next step"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={goNext}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              aria-label="Post gig"
              disabled={isSubmitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {isSubmitting ? "Posting..." : "Post Gig"}
            </Button>
          )}
        </div>
      </form>
    </BusinessShell>
  );
}

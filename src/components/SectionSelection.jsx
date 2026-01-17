import React, { useState } from "react";
import { ChevronRight, Users, GraduationCap } from "lucide-react";
import clsx from "clsx";

const SECTIONS = {
  "1st Year": ["101", "102", "103", "104"],
  "2nd Year": ["201", "202", "203"],
  "3rd Year": ["301"],
};

export default function SectionSelection({ onSelectSection }) {
  const [selectedYear, setSelectedYear] = useState(null);

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center p-4 font-sans text-on-surface">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-[20px] shadow-elevation-2 mb-2">
            <GraduationCap className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            Select Class Section
          </h1>
          <p className="text-on-surface-variant/80 text-lg">
            Choose a year level and section to manage attendance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Year Level List */}
          <div className="bg-surface rounded-3xl shadow-elevation-1 border border-outline-variant/30 overflow-hidden">
            <div className="p-4 bg-surface-container border-b border-outline-variant/20 font-bold text-on-surface-variant uppercase tracking-wider text-xs">
              Year Level
            </div>
            <div className="p-3 space-y-2">
              {Object.keys(SECTIONS).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={clsx(
                    "w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer",
                    selectedYear === year
                      ? "bg-primary text-on-primary shadow-elevation-1"
                      : "hover:bg-surface-container-high text-on-surface hover:text-primary",
                  )}
                >
                  <span className="font-semibold text-sm md:text-base">
                    {year}
                  </span>
                  <ChevronRight
                    className={clsx(
                      "w-5 h-5 transition-transform",
                      selectedYear === year
                        ? "text-on-primary"
                        : "text-outline/50 group-hover:text-primary",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Section List (Animated) */}
          <div
            className={clsx(
              "bg-surface rounded-3xl shadow-elevation-1 border border-outline-variant/30 overflow-hidden transition-all duration-300",
              selectedYear
                ? "opacity-100 translate-x-0"
                : "opacity-50 translate-x-4 pointer-events-none grayscale",
            )}
          >
            <div className="p-4 bg-surface-container border-b border-outline-variant/20 font-bold text-on-surface-variant uppercase tracking-wider text-xs flex justify-between items-center">
              <span>
                {selectedYear ? `${selectedYear} Sections` : "Select a Section"}
              </span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3 min-h-[200px] relative">
              {!selectedYear && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant/60">
                  <GraduationCap className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">
                    Select a Year Level from the left to view sections
                  </p>
                </div>
              )}
              {selectedYear &&
                SECTIONS[selectedYear].map((section) => (
                  <button
                    key={section}
                    onClick={() => onSelectSection(section)}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low hover:border-primary hover:bg-primary-container/30 transition-all group cursor-pointer"
                  >
                    <div className="bg-primary-container text-primary p-3 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-on-surface text-base group-hover:text-primary">
                      Section {section}
                    </span>
                  </button>
                ))}
              {selectedYear && SECTIONS[selectedYear].length === 0 && (
                <div className="col-span-2 text-center py-8 text-outline/60 italic text-sm">
                  No sections available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

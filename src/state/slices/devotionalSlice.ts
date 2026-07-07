import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface DevotionalEntry {
  id: string;
  title: string;
  date: string; // e.g. "January 1"
  readingTime: number; // minutes
  scriptureRef: string;
  scriptureText: string;
  body: string[];
  prayer: string;
  reflection: string;
  actionPoints: string[];
}

export interface DevotionalPackage {
  id: string;
  category: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional";
  year: number;
  status: "Published" | "Draft" | "Archived";
  entriesCount: number;
  publishedAt: string; // e.g., "June 3, 2027"
  entries: DevotionalEntry[];
}

interface DevotionalState {
  packages: DevotionalPackage[];
  storageUsedMB: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Procedural generator to create a complete year of devotionals
export function generate365Days(category: string, year: number): DevotionalEntry[] {
  const entries: DevotionalEntry[] = [];
  let idCounter = 1;
  
  const scriptures = [
    { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
    { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good..." },
    { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding." },
    { ref: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles..." },
    { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
    { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed..." },
    { ref: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you." }
  ];
  
  const topics = ["Faith", "Peace", "Deliverance", "Purity", "Grace", "Stillness", "Courage", "Hope", "Love", "Repentance"];

  for (let m = 0; m < 12; m++) {
    const days = DAYS_IN_MONTH[m];
    // Simple check for leap years
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const actualDays = (m === 1 && isLeap) ? 29 : days;
    
    for (let d = 1; d <= actualDays; d++) {
      const dateStr = `${MONTH_NAMES[m]} ${d}`;
      const idx = (idCounter - 1) % scriptures.length;
      const topic = topics[(idCounter - 1) % topics.length];
      
      entries.push({
        id: `dev-${category.toLowerCase().replace(/\s+/g, '-')}-${year}-${idCounter}`,
        title: `Walking in ${topic} (${dateStr})`,
        date: dateStr,
        readingTime: 5 + (idCounter % 6),
        scriptureRef: scriptures[idx].ref,
        scriptureText: scriptures[idx].text,
        body: [
          `This is a devotion for ${dateStr} focusing on the spiritual journey of ${topic.toLowerCase()}. In our daily walk, we encounter many situations that require us to align our hearts with the Word of God.`,
          `As we meditate on ${scriptures[idx].ref}, we are reminded that God's promises are yes and amen. We must continue to stand firm, resisting the temptations of doubt and fear that easily beset us.`,
          `Let this day be a reminder of His steadfast love and guidance in all aspects of your life.`
        ],
        prayer: `Father, thank You for the message of ${topic.toLowerCase()} today. Help me to live according to Your word and trust in Your guidance for ${dateStr}. Amen.`,
        reflection: `How does the theme of ${topic.toLowerCase()} apply to your challenges today?`,
        actionPoints: [
          `Spend 5 minutes meditating on ${scriptures[idx].ref}.`,
          `Write down one way you can express ${topic.toLowerCase()} in your actions today.`,
          `Pray for a brother or sister who needs encouragement in this area.`
        ]
      });
      idCounter++;
    }
  }
  return entries;
}

// Helper to format date published
const getFormattedDate = (daysAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  return `${date.toLocaleDateString('en-US', options)}, ${date.getFullYear()}`;
};

const initialPackages: DevotionalPackage[] = [
  // 2027 Active Packages
  {
    id: "pkg-dd-2027",
    category: "Daily Deliverance",
    year: 2027,
    status: "Published",
    entriesCount: 365,
    publishedAt: getFormattedDate(34),
    entries: generate365Days("Daily Deliverance", 2027)
  },
  {
    id: "pkg-pr-2027",
    category: "Prayer",
    year: 2027,
    status: "Published",
    entriesCount: 365,
    publishedAt: getFormattedDate(12),
    entries: generate365Days("Prayer", 2027)
  },
  {
    id: "pkg-ho-2027",
    category: "Holiness",
    year: 2027,
    status: "Published",
    entriesCount: 365,
    publishedAt: getFormattedDate(22),
    entries: generate365Days("Holiness", 2027)
  },
  {
    id: "pkg-yr-2027",
    category: "Yearly Devotional",
    year: 2027,
    status: "Published",
    entriesCount: 365,
    publishedAt: getFormattedDate(5),
    entries: generate365Days("Yearly Devotional", 2027)
  },
  
  // 2026 Historical Packages (Archived)
  {
    id: "pkg-dd-2026",
    category: "Daily Deliverance",
    year: 2026,
    status: "Archived",
    entriesCount: 365,
    publishedAt: "January 1, 2026",
    entries: generate365Days("Daily Deliverance", 2026)
  },
  {
    id: "pkg-pr-2026",
    category: "Prayer",
    year: 2026,
    status: "Archived",
    entriesCount: 365,
    publishedAt: "January 1, 2026",
    entries: generate365Days("Prayer", 2026)
  },
  {
    id: "pkg-ho-2026",
    category: "Holiness",
    year: 2026,
    status: "Archived",
    entriesCount: 365,
    publishedAt: "January 1, 2026",
    entries: generate365Days("Holiness", 2026)
  },
  {
    id: "pkg-yr-2026",
    category: "Yearly Devotional",
    year: 2026,
    status: "Archived",
    entriesCount: 365,
    publishedAt: "January 1, 2026",
    entries: generate365Days("Yearly Devotional", 2026)
  },

  // 2025 Historical Packages (Archived)
  {
    id: "pkg-dd-2025",
    category: "Daily Deliverance",
    year: 2025,
    status: "Archived",
    entriesCount: 365,
    publishedAt: "January 1, 2025",
    entries: generate365Days("Daily Deliverance", 2025)
  }
];

const initialState: DevotionalState = {
  packages: initialPackages,
  storageUsedMB: 45.2
};

export const devotionalSlice = createSlice({
  name: "devotionals",
  initialState,
  reducers: {
    publishPackage: (
      state,
      action: PayloadAction<{
        category: "Daily Deliverance" | "Holiness" | "Prayer" | "Yearly Devotional";
        year: number;
        entries: DevotionalEntry[];
      }>
    ) => {
      const { category, year, entries } = action.payload;

      // 1. Archive any existing package of the same category and year, or indeed archive ANY package of the same category
      state.packages.forEach((pkg) => {
        if (pkg.category === category) {
          pkg.status = "Archived";
        }
      });

      // 2. Add/replace package
      const pkgIndex = state.packages.findIndex(
        (pkg) => pkg.category === category && pkg.year === year
      );

      const newPkg: DevotionalPackage = {
        id: `pkg-${category.toLowerCase().substring(0, 2)}-${year}-${Date.now()}`,
        category,
        year,
        status: "Published",
        entriesCount: entries.length,
        publishedAt: getFormattedDate(0),
        entries
      };

      if (pkgIndex > -1) {
        state.packages[pkgIndex] = newPkg;
      } else {
        state.packages.unshift(newPkg);
      }

      // Increase storage used a bit for the new package (approx 3.2 MB per package)
      state.storageUsedMB = parseFloat((state.storageUsedMB + 3.2).toFixed(1));
    },
    rollbackPackage: (state, action: PayloadAction<{ packageId: string }>) => {
      const targetPkg = state.packages.find((p) => p.id === action.payload.packageId);
      if (targetPkg) {
        // Archive others of same category
        state.packages.forEach((p) => {
          if (p.category === targetPkg.category) {
            p.status = "Archived";
          }
        });
        // Publish this one
        targetPkg.status = "Published";
      }
    },
    deletePackage: (state, action: PayloadAction<{ packageId: string }>) => {
      state.packages = state.packages.filter((p) => p.id !== action.payload.packageId);
      state.storageUsedMB = Math.max(5.0, parseFloat((state.storageUsedMB - 3.2).toFixed(1)));
    }
  }
});

export const { publishPackage, rollbackPackage, deletePackage } = devotionalSlice.actions;

export const selectPackages = (state: RootState) => state.devotionals.packages;
export const selectStorageUsed = (state: RootState) => state.devotionals.storageUsedMB;

export default devotionalSlice.reducer;

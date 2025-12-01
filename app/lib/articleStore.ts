// Simple client-side article store using localStorage
// In production, this would connect to a backend API

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  heroImage: string;
  content: string; // HTML content from Tiptap
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "blog_articles";

// Default articles to seed the store
const defaultArticles: Article[] = [
  {
    id: "1",
    slug: "finding-peace-in-chaos",
    title: "Finding Peace in the Chaos of Everyday Life",
    subtitle:
      "In a world that never stops moving, discovering moments of stillness has become both a challenge and a necessity.",
    category: "Mindfulness",
    date: "November 28, 2025",
    readTime: "8 min read",
    author: "Journal",
    heroImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80",
    content: `<p>There's a peculiar kind of silence that exists in the early morning hours, before the world wakes up and fills itself with noise. It's in these moments that I've found the most clarity—not through meditation apps or productivity hacks, but through the simple act of being present.</p>
<p>We live in an age of constant stimulation. Our phones buzz with notifications, our calendars overflow with commitments, and our minds race with endless to-do lists. The idea of finding peace seems almost laughable when there's always something demanding our attention.</p>
<h2>The Myth of Multitasking</h2>
<p>For years, I prided myself on my ability to juggle multiple tasks at once. I would answer emails while on calls, scroll through social media while eating lunch, and plan tomorrow while living today. I thought this made me efficient. In reality, it made me exhausted.</p>
<blockquote><p>"The greatest weapon against stress is our ability to choose one thought over another." — William James</p></blockquote>
<p>The turning point came during a particularly overwhelming week. I had deadlines stacking up, personal commitments I couldn't postpone, and the persistent feeling that I was falling behind in everything. It was then that I stumbled upon a simple truth: you cannot pour from an empty cup.</p>
<h2>Small Rituals, Big Changes</h2>
<p>Change didn't happen overnight. It started with small, intentional rituals. A cup of tea in the morning, savored slowly. A five-minute walk around the block after lunch. Putting my phone in another room during dinner. These weren't revolutionary acts—they were tiny rebellions against the culture of constant busyness.</p>
<p>What surprised me most was how quickly these small moments of stillness began to compound. My thoughts became clearer. My work improved. My relationships deepened. Not because I was doing more, but because I was finally doing less—with intention.</p>
<h3>Key Takeaways</h3>
<ul>
<li>Peace isn't found by eliminating chaos—it's cultivated within it</li>
<li>Small, consistent rituals are more powerful than grand gestures</li>
<li>Being present doesn't require special tools or techniques</li>
<li>Rest is not a reward for productivity—it's a prerequisite for it</li>
</ul>
<p>The chaos of everyday life isn't going anywhere. There will always be more emails, more obligations, more reasons to feel overwhelmed. But within that chaos, there are pockets of peace waiting to be discovered. They exist in the space between activities, in the pause before responding, in the decision to simply breathe.</p>
<p>Finding peace isn't about escaping reality—it's about changing how we move through it. And that, perhaps, is the most liberating realization of all.</p>`,
    published: true,
    createdAt: "2025-11-28T10:00:00Z",
    updatedAt: "2025-11-28T10:00:00Z",
  },
  {
    id: "2",
    slug: "art-of-slow-living",
    title: "The Art of Slow Living",
    subtitle:
      "Why rushing through life means missing the beauty in the details.",
    category: "Lifestyle",
    date: "November 15, 2025",
    readTime: "6 min read",
    author: "Journal",
    heroImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=80",
    content: `<p>In a world obsessed with speed and efficiency, there's a quiet revolution happening. People are choosing to slow down, to savor, to be intentional about how they spend their time. This is the art of slow living.</p>
<p>Slow living isn't about doing everything at a snail's pace. It's about doing things at the right pace—giving each moment the attention it deserves. It's about quality over quantity, depth over breadth.</p>
<h2>What We Miss When We Rush</h2>
<p>When we're constantly rushing from one thing to the next, we miss the texture of life. The way morning light filters through the window. The taste of our coffee. The sound of birds outside. These small details are what make up a life well-lived.</p>
<blockquote><p>"Nature does not hurry, yet everything is accomplished." — Lao Tzu</p></blockquote>
<p>I used to measure my days by how much I accomplished. Now I measure them by how fully I lived. The difference has been transformative.</p>
<h3>Principles of Slow Living</h3>
<ul>
<li>Do one thing at a time, with full attention</li>
<li>Create space between activities for transition and reflection</li>
<li>Value experiences over possessions</li>
<li>Embrace boredom as a gateway to creativity</li>
</ul>
<p>The art of slow living is a practice, not a destination. Some days I succeed, others I fall back into old patterns. But each moment of presence is a small victory, a reminder of what's possible when we choose intention over autopilot.</p>`,
    published: true,
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "3",
    slug: "letters-to-my-younger-self",
    title: "Letters to My Younger Self",
    subtitle: "What I wish I knew when I was starting out.",
    category: "Reflections",
    date: "November 02, 2025",
    readTime: "7 min read",
    author: "Journal",
    heroImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=80",
    content: `<p>If I could send a letter back through time to my younger self, what would I say? What wisdom would I share, knowing what I know now? These are the things I wish someone had told me.</p>
<h2>Dear Younger Me,</h2>
<p>First, stop trying so hard to fit in. The things that make you different are exactly the things that will make you interesting. Your quirks aren't flaws to be fixed—they're features to be celebrated.</p>
<p>Second, failure is not the opposite of success—it's part of it. Every mistake is a lesson, every setback is a setup for a comeback. Don't be afraid to fail; be afraid of never trying.</p>
<blockquote><p>"We are all just walking each other home." — Ram Dass</p></blockquote>
<p>Third, the people who matter don't mind, and the people who mind don't matter. Spend your energy on relationships that nourish you, not ones that drain you.</p>
<h3>Things I Wish I Knew</h3>
<ul>
<li>Your worth is not determined by your productivity</li>
<li>It's okay to change your mind, your path, your entire life</li>
<li>Comparison is the thief of joy—run your own race</li>
<li>The best time to start is always now</li>
</ul>
<p>Most importantly, be patient with yourself. You're figuring things out as you go, just like everyone else. There's no manual for life, no perfect path to follow. Trust the process, trust yourself, and keep moving forward.</p>
<p>With love and hindsight, Your Future Self</p>`,
    published: true,
    createdAt: "2025-11-02T10:00:00Z",
    updatedAt: "2025-11-02T10:00:00Z",
  },
  {
    id: "4",
    slug: "minimalism-beyond-aesthetics",
    title: "Minimalism Beyond Aesthetics",
    subtitle: "It's not about having less, it's about making room for more.",
    category: "Design",
    date: "October 20, 2025",
    readTime: "5 min read",
    author: "Journal",
    heroImage:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1400&q=80",
    content: `<p>When people think of minimalism, they often picture stark white rooms with sparse furniture and carefully curated objects. But true minimalism goes far beyond aesthetics—it's a philosophy of intentionality that can transform every aspect of your life.</p>
<p>Minimalism isn't about deprivation or living with nothing. It's about clearing away the excess so you can focus on what truly matters. It's about creating space—physical, mental, and emotional—for the things that bring you joy and meaning.</p>
<h2>The Weight of Excess</h2>
<p>Every object we own takes up not just physical space, but mental space. It requires our attention, our maintenance, our decision-making energy. When we're surrounded by excess, we're constantly managing, organizing, cleaning—leaving less capacity for creativity, connection, and rest.</p>
<blockquote><p>"The more you have, the more you are occupied. The less you have, the more free you are." — Mother Teresa</p></blockquote>
<h3>Principles of True Minimalism</h3>
<ul>
<li>Keep only what adds value or brings joy</li>
<li>Quality over quantity in all things</li>
<li>Create systems that reduce daily decisions</li>
<li>Invest in experiences rather than possessions</li>
</ul>
<p>The journey to minimalism is personal and ongoing. It's not about reaching a destination where you own a specific number of items. It's about constantly asking yourself: does this serve my life? Does this align with my values? If not, let it go.</p>`,
    published: true,
    createdAt: "2025-10-20T10:00:00Z",
    updatedAt: "2025-10-20T10:00:00Z",
  },
];

// Initialize store with default articles if empty
function initializeStore(): Article[] {
  if (typeof window === "undefined") return defaultArticles;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultArticles));
    return defaultArticles;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return defaultArticles;
  }
}

// Get all articles
export function getArticles(): Article[] {
  return initializeStore();
}

// Get published articles only
export function getPublishedArticles(): Article[] {
  return getArticles().filter((a) => a.published);
}

// Get article by slug
export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

// Get article by ID
export function getArticleById(id: string): Article | undefined {
  return getArticles().find((a) => a.id === id);
}

// Create a new article
export function createArticle(
  article: Omit<Article, "id" | "createdAt" | "updatedAt">
): Article {
  const articles = getArticles();
  const now = new Date().toISOString();

  const newArticle: Article = {
    ...article,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  articles.unshift(newArticle);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));

  return newArticle;
}

// Update an existing article
export function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>
): Article | undefined {
  const articles = getArticles();
  const index = articles.findIndex((a) => a.id === id);

  if (index === -1) return undefined;

  articles[index] = {
    ...articles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  return articles[index];
}

// Delete an article
export function deleteArticle(id: string): boolean {
  const articles = getArticles();
  const filtered = articles.filter((a) => a.id !== id);

  if (filtered.length === articles.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Calculate read time from content
export function calculateReadTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

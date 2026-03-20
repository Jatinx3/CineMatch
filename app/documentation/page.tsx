"use client";

import { useSystemStats } from "@/lib/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { Database, Zap, Activity, Cpu } from "lucide-react";

export default function DocumentationPage() {
  const { data: stats, isLoading, error } = useSystemStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#f43f5e] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#a1a1aa] font-medium tracking-tight">Loading ML Stats…</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <p className="text-red-500 font-bold bg-red-500/10 px-6 py-4 rounded-xl">
          Failed to load System Stats. Verify Backend is running!
        </p>
      </div>
    );
  }

  // Format genre data for recharts
  const genreData = Object.entries(stats.genres_distribution).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#f43f5e]/30 font-sans pb-24">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-20">
        
        {/* ── Header ── */}
        <header className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <span className="text-xl">🎬</span>
              <span className="text-sm font-black tracking-tight text-white group-hover:text-[#f43f5e] transition-colors">
                CineMatch
              </span>
            </Link>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full xs:w-auto">
              <Link
                href="https://github.com/Jatinx3/CineMatch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#a1a1aa] hover:text-white transition-colors uppercase tracking-widest inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
              >
                💻 GitHub
              </Link>
              <Link
                href="/"
                className="text-xs font-bold text-[#f43f5e] hover:text-[#fb7185] transition-colors uppercase tracking-widest inline-flex items-center gap-2"
              >
                <span className="text-lg">←</span> BACK TO APP
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
              ML System Docs
            </h1>
            <p className="text-lg md:text-xl text-[#a1a1aa] font-medium max-w-3xl leading-relaxed">
              Real-time insights and structural overview of the AI recommendation engine powering our discovery pipelines.
            </p>
          </div>
        </header>

        {/* ── Top Metrics Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Movies Analyzed" 
            value={stats.total_movies.toLocaleString()} 
            sub="+87K indexed nodes" 
            icon={<Database className="w-5 h-5 text-[#f43f5e]" />} 
          />
          <StatCard 
            title="BERT Embeddings" 
            value={stats.bert.embeddings_count.toLocaleString()} 
            sub="Dense 384d Space" 
            icon={<Zap className="w-5 h-5 text-[#c084fc]" />} 
          />
          <StatCard 
            title="TF-IDF Vocabulary" 
            value={stats.tfidf.vocab_size.toLocaleString()} 
            sub="Unique Unigrams/Bigrams" 
            icon={<Cpu className="w-5 h-5 text-[#fb7185]" />} 
          />
          <StatCard 
            title="Matrix Dimensions" 
            value={stats.bert.dimensions.toLocaleString()} 
            sub="L2 Normalized Float32" 
            icon={<Activity className="w-5 h-5 text-[#818cf8]" />} 
          />
        </div>

        {/* ── System Architecture Overview ── */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="text-3xl">🧠</span> System Architecture Overview
            </h2>
            <p className="text-base font-medium text-[#a1a1aa] leading-relaxed max-w-4xl">
              The underlying engine relies on a dual-vectorization strategy. Initially, raw metadata including TMDB Overviews, TMDB Keywords, Tag aggregations, and standard Genres are cleanly concatenated into a master feature block (<i className="text-[#f43f5e]">e.g., "Action Adventure Sci-Fi..."</i>). This payload is then pumped through parallel ML pipelines generating dense contextual mappings.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* 01 TF-IDF Engine */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#f43f5e] font-mono text-sm tracking-widest">01</span> TF-IDF Engine
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">
                  The Term Frequency-Inverse Document Frequency (TF-IDF) system builds a 15,000-dimensional sparse vocabulary matrix. It heavily weights unique unigrams and bigrams (e.g. <i>"Space Marine", "Romance"</i>). It serves as an ultra-fast structural lexical parser excellent at surfacing historically accurate, perfectly matched genre categories deterministically globally.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Dimensions:" value="15,000" color="rose" />
                  <Badge label="N-grams:" value="1-2" color="blue" />
                  <Badge label="Min DF:" value="2" color="green" />
                </div>
              </div>

              {/* Code Snippet */}
              <div className="mt-8 bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-auto text-xs font-mono text-gray-500">python</span>
                </div>
                <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-loose text-gray-300 w-full">
                  <pre className="overflow-x-auto">
<span className="text-gray-500">from</span> <span className="text-blue-400">sklearn.feature_extraction.text</span> <span className="text-gray-500">import</span> <span className="text-[#f43f5e]">TfidfVectorizer</span>

vectorizer = <span className="text-[#f43f5e]">TfidfVectorizer</span>(
    max_features=<span className="text-orange-400">15000</span>,
    ngram_range=(<span className="text-orange-400">1</span>, <span className="text-orange-400">2</span>),
    min_df=<span className="text-orange-400">2</span>
)
tfidf_matrix = vectorizer.fit_transform(corpus)
                  </pre>
                </div>
              </div>
            </div>

            {/* 02 BERT Neural Net */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-[#c084fc] font-mono text-sm tracking-widest">02</span> BERT Neural Net
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">
                  The all-MiniLM-L6-v2 (Sentence-Transformers) layer maps contextual representations in 384-dimensional dense floating-point space. Rather than strictly matching vocabulary, BERT understands deeper abstract "moods", conceptual themes, and underlying emotions inherently bridging distant narrative similarities elegantly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Model:" value="MiniLM-L6-v2" color="purple" />
                  <Badge label="Dimensions:" value="384" color="orange" />
                  <Badge label="Batch Size:" value="32" color="blue" />
                </div>
              </div>

              {/* Code Snippet */}
              <div className="mt-8 bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-auto text-xs font-mono text-gray-500">python</span>
                </div>
                <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-loose text-gray-300 w-full">
                  <pre className="overflow-x-auto">
<span className="text-gray-500">from</span> <span className="text-blue-400">sentence_transformers</span> <span className="text-gray-500">import</span> <span className="text-[#c084fc]">SentenceTransformer</span>

model = <span className="text-[#c084fc]">SentenceTransformer</span>(
    <span className="text-green-400">'all-MiniLM-L6-v2'</span>
)
embeddings = model.encode(
    texts,
    batch_size=<span className="text-orange-400">32</span>,
    show_progress_bar=<span className="text-[#fb7185]">True</span>
)
                  </pre>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 bg-[#111111] border border-[#f43f5e]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-[0_0_30px_rgba(244,63,94,0.05)] relative overflow-hidden group hover:border-[#f43f5e]/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f43f5e]" />
            <div className="flex-1 space-y-4 pl-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#f43f5e]">⚡</span> Context Window Breakthrough
              </h3>
              <p className="text-[#a1a1aa] leading-relaxed text-sm font-medium">
                When <code className="text-[#c084fc] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">max_seq_length</code> was historically capped at 256 tokens, BERT was forced to choose between reading the overarching plot summary or explicit metadata tags—rendering the neural net "half-blind". By expanding the transformer limit to <strong className="text-white">512 tokens</strong>, the model gained enough working memory to perfectly encode semantic meaning alongside dense genre features simultaneously. This breakthrough natively outperformed rigidly exact TF-IDF matching globally.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
              <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1">Deep Learning Precision</p>
                <p className="text-3xl font-black text-[#f43f5e]">0.290</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1">Max Token Window</p>
                <p className="text-3xl font-black text-[#818cf8]">512</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hybrid Fusion Layer & Optimization ── */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 group hover:border-white/10 transition-colors">
             <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-[#f43f5e] font-mono text-sm tracking-widest">03</span> Popularity Rebalancing
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">
                Blends dense semantic tracking or lexical similarity scores natively with historical consensus metrics, avoiding arbitrary threshold cutoffs. The mathematical framework applies an <code className="text-[#c084fc] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">alpha</code> coefficient heavily favoring embedding accuracy while organically boosting globally engaged blockbusters naturally.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Badge label="Vector Weight:" value="0.7 (α)" color="rose" />
                <Badge label="Pop. Weight:" value="0.3 (1-α)" color="purple" />
                <Badge label="Similarity:" value="Dot Product" color="blue" />
              </div>

              <div className="mt-6 bg-[#0a0a0a] rounded-xl p-6 border border-white/10 font-mono text-sm space-y-4">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Semantic Vector Score</span>
                  <span className="text-green-400 font-bold">0.872</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Log Popularity Modifier</span>
                  <span className="text-green-400 font-bold">0.934</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between items-center font-bold text-white">
                  <span>Final Rec Score</span>
                  <span className="text-[#f43f5e]">0.909</span>
                </div>
              </div>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
             <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-[#f43f5e] font-mono text-sm tracking-widest">04</span> Processing & Normalization
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">
                Math heavy lifting is achieved instantly scaling to millions of rows via exact <code>L2 Array Normalisation</code> during server boot. This eliminates real-time cosine loops by flattening multi-dimensional spaces allowing precise native `<code className="text-[#f43f5e]">Matrix.dot()</code>` algorithms exclusively.
              </p>
              
              <div className="flex gap-4">
                <Badge label="Normalisation:" value="L2 / Euclidean" color="green" />
                <Badge label="Compute Time:" value="O(N)" color="orange" />
              </div>

               <div className="mt-6 grid grid-cols-2 gap-4">
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 text-center transition-colors hover:border-white/20">
                   <p className="text-xs font-bold text-gray-500 uppercase flex items-center justify-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-green-500" /> Warm Vector
                   </p>
                   <p className="text-3xl font-black text-white">12ms</p>
                 </div>
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 text-center transition-colors hover:border-white/20">
                   <p className="text-xs font-bold text-gray-500 uppercase flex items-center justify-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-orange-500" /> Cold Profile
                   </p>
                   <p className="text-3xl font-black text-white">94ms</p>
                 </div>
               </div>
          </div>
        </section>

        {/* ── Live Dataset Metrics ── */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="text-3xl">📊</span> Live Dataset Metrics
          </h2>

          <div className="w-full h-[400px] bg-[#111111] rounded-2xl border border-white/5 p-4 sm:p-8 shadow-2xl group hover:border-white/10 transition-colors flex flex-col">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              Structural Genre Pipeline Distribution
              <div className="flex gap-2 items-center text-xs text-[#f43f5e]">
                <span className="w-3 h-3 rounded-full bg-[#f43f5e] animate-pulse" /> Live Analysis
              </div>
            </h3>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false}
                    dx={-12}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a', color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#be123c" 
                    activeBar={{ fill: '#f43f5e' }}
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Infrastructure & Pipeline ── */}
        <section className="space-y-8">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-8">
            <span className="text-3xl text-rose-500">⚙️</span> Infrastructure & Pipeline
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <PipelineCard 
              icon={<Database className="w-5 h-5 text-blue-400" />}
              title="Data Mapping"
              items={[
                "Global movie metadata parsing",
                "Genre pipeline normalization",
                "Massive NumPy matrix ingestion"
              ]}
            />
            <PipelineCard 
              icon={<Activity className="w-5 h-5 text-green-400" />}
              title="Model Training"
              items={[
                "SentenceTransformers processing",
                "TF-IDF dynamic fitting algorithms",
                "Profile-weighted aggregation"
              ]}
            />
            <PipelineCard 
              icon={<Cpu className="w-5 h-5 text-purple-400" />}
              title="Optimization"
              items={[
                "Sparse Matrix multiplication",
                "L2 Space dimensionality reduction",
                "Dynamic runtime normalization"
              ]}
            />
          </div>

          <div className="mt-8 bg-gradient-to-r from-[#171717] via-[#1a1012] to-[#120a11] rounded-2xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="text-center md:text-left">
              <p className="text-4xl md:text-5xl font-black text-white mb-2">99.99%</p>
              <p className="text-sm font-medium text-gray-500">Uptime SLA</p>
            </div>
            <div className="w-px h-16 bg-white/10 hidden md:block" />
            <div className="text-center md:text-left">
              <p className="text-4xl md:text-5xl font-black text-white mb-2">87.5K</p>
              <p className="text-sm font-medium text-gray-500">Total Graph Nodes</p>
            </div>
            <div className="w-px h-16 bg-white/10 hidden md:block" />
             <div className="text-center md:text-left">
              <p className="text-4xl md:text-5xl font-black text-white mb-2">384d</p>
              <p className="text-sm font-medium text-gray-500">Dense Geometry</p>
            </div>
            <div className="w-px h-16 bg-white/10 hidden md:block" />
            <div className="text-center md:text-left">
              <p className="text-4xl md:text-5xl font-black text-white mb-2">12ms</p>
              <p className="text-sm font-medium text-gray-500">Median Dot-Product</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

{/* Helper Components */}

function StatCard({ title, value, sub, icon }: { title: string; value: string | number, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col justify-center gap-3 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-4 right-4 bg-white/5 p-2.5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-1">{value}</p>
      <p className="text-xs font-medium text-gray-500">{sub}</p>
    </div>
  );
}

function Badge({ label, value, color }: { label: string, value: string, color: 'rose' | 'blue' | 'green' | 'purple' | 'orange' }) {
  const colorMap = {
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    green: 'border-green-500/30 text-green-400 bg-green-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  }
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${colorMap[color]}`}>
      <span className="opacity-70 font-medium">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function PipelineCard({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) {
  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-lg group hover:border-white/10 transition-colors">
      <div className="mb-6 flex gap-3 flex-col items-start bg-transparent">
        {icon}
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#f43f5e] mt-2 opacity-80" />
             <span className="text-sm font-medium text-gray-400 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

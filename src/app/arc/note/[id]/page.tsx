import { getGMNoteById } from '@/lib/sanityQueries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

export default async function GMNoteViewPage({ params }: { params: any }) {
    // If using Next.js 15, you MUST await params
    const resolvedParams = await params;
    const note = await getGMNoteById(resolvedParams.id);

    if (!note) return notFound()

    return (
        <main className="min-h-screen relative overflow-x-hidden p-8"
              style={{
                  // THE FLOOR: A dark stone or wood below the table
                  backgroundColor: '#120b06',
                  backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px), url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
                  backgroundSize: '80px 100%, auto',
              }}>

            {/* THE ACTUAL TABLE: Centered container with edges */}
            <div
                className="relative m-2 md:m-6 rounded-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border-[10px] border-[#2c1a0f]"
                style={{
                    // REDDISH-BROWN WOOD: Dark Mahogany/Oak feel
                    backgroundColor: '#3d1c10',
                    backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.2) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.4) 100%),
                        url('https://www.transparenttextures.com/patterns/dark-wood.png')
                    `,
                    boxShadow: `
                        inset 0 0 100px rgba(0,0,0,0.5), 
                        0 20px 40px rgba(0,0,0,0.8),
                        0 0 0 4px #1a0f05
                    `
                }}>

                {/* 1. WARM CANDLE LIGHT LAYER */}
                <div className="absolute inset-0 pointer-events-none rounded-[10px] bg-[radial-gradient(circle_at_85%_15%,rgba(255,180,100,0.15)_0%,rgba(0,0,0,0.2)_100%)]"/>

                {/* 2. THE REALISTIC, ANGLED CANDLE (Top Right) */}
                <div
                    className="absolute top-5 right-10 w-48 h-64 opacity-95 pointer-events-none select-none hidden xl:block"
                    style={{
                        perspective: '1000px',
                        zIndex: 20,
                    }}
                >
                    <div className="w-full h-full relative"
                         style={{
                             transform: 'rotateX(15deg) rotateY(-5deg) rotateZ(5deg)',
                             transformStyle: 'preserve-3d',
                         }}>
                        <div className="absolute bottom-30 left-4/5 w-16 h-32 bg-black/60 blur-xl origin-bottom"
                             style={{ transform: 'translateX(-120%) rotateX(20deg) skewX(-20deg)' }} />
                        <div className="absolute bottom-17 left-1/2 -translate-x-1/2 w-23 h-9 bg-black/90 blur-sm rounded-full"/>
                        <img src="/images/textures/dnd-candle.webp" alt="DM Candle" className="relative z-10 w-full h-auto object-contain" style={{ filter: 'brightness(0.8) contrast(1.2)' }} />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-40 h-24 bg-amber-900/30 blur-3xl rounded-full"/>
                        <div className="absolute top-0 left-[47%] w-4 h-6 rounded-full bg-amber-400 blur-sm animate-pulse"
                             style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, #fbbf24 50%, #f97316 100%)', boxShadow: '0 0 25px 8px rgba(251,191,36,0.5)', transform: 'translateZ(20px)' }} />
                    </div>
                </div>

                {/* 3. CONTENT AREA WRAPPER: Ensures the paper can expand but stays centered */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">

                    {/* Back Link */}
                    <Link href="/arc" className="self-start mb-8 text-amber-600 hover:text-amber-400 font-serif text-sm transition-colors">
                        ← Return to Arc Archive
                    </Link>

                    {/* THE PARCHMENT SCROLL */}
                    <div
                        className="relative w-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-2 border-[#5c4033] rounded-lg overflow-hidden"
                        style={{
                            // MATCHING GM WORKSHOP SETTINGS EXACTLY
                            backgroundColor: 'rgba(255, 252, 245, 0.2)',
                            backgroundImage: "url('/images/textures/parchment.jpg')",
                            backgroundSize: 'cover',
                            backgroundBlendMode: 'color-dodge', // Added back from workshop
                            padding: '5rem 5rem 3rem 5rem', // Exact Workshop padding (Top, Left/Right, Bottom)
                            minHeight: '100vh',
                            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1), 0 30px 60px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Corner Shadows for depth */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" />

                        {/* Metadata */}
                        <div className="mb-10 text-center relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-900/60 font-bold">
                {note.category}
            </span>
                            <h1 className="text-4xl md:text-5xl text-[#1a0d05] mt-2 mb-4"
                                style={{ fontFamily: 'var(--font-cinzel)' }}>
                                {note.title}
                            </h1>
                            <div className="w-32 h-px bg-amber-900/20 mx-auto" />
                        </div>

                        {/* Content Area - Added 'max-w-none' to break the Prose width limit */}
                        <div className="prose prose-stone max-w-none relative z-10"
                             style={{
                                 fontFamily: 'var(--font-cursive), cursive',
                                 fontSize: '1.6rem',
                                 lineHeight: '2.5rem', // Slightly increased for that hand-written feel
                                 color: '#000000', // Changed to black to match Workshop
                             }}>
                            <PortableText value={note.content} />
                        </div>

                        {/* Bottom Signature / Date */}
                        <div className="mt-20 pt-8 border-t border-amber-900/10 text-right relative z-10">
                            <p className="text-amber-900/40 italic text-sm" style={{ fontFamily: 'var(--font-cursive)' }}>
                                Recorded on {new Date(note._updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
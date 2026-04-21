'use client'

import { useState, useEffect } from 'react'
import { adminClient as client } from '@/lib/sanityAdmin'
import Link from 'next/link'
import BackNavigation from '@/components/BackNavigation'

interface GMNote {
    _id: string
    title: string
    category: string
    content: any[]
    isPublished: boolean
    tags: string[]
    _updatedAt: string
    _createdAt: string
}

export default function GMWorkshopPage() {
    const [notes, setNotes] = useState<GMNote[]>([])
    const [selectedNote, setSelectedNote] = useState<GMNote | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editCategory, setEditCategory] = useState('misc')
    const [editTags, setEditTags] = useState('')
    const [editContent, setEditContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isEditing) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [isEditing]);

    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        const query = `*[_type == "gmNote"] | order(_updatedAt desc) {
            _id,
            title,
            category,
            content,
            isPublished,
            tags,
            _updatedAt,
            _createdAt
        }`
        const data = await client.fetch(query)
        setNotes(data)
        setIsLoading(false)
    }

    const createNewNote = async () => {
        const newNote = {
            _type: 'gmNote',
            title: 'Untitled Note',
            category: 'misc',
            content: [{ _type: 'block', children: [{ _type: 'span', text: 'Start writing your ideas here...' }] }],
            tags: [],
            isPublished: false
        }

        const created = await client.create(newNote)
        await fetchNotes()
        setSelectedNote(created)
        setIsEditing(true)
        setEditTitle(created.title)
        setEditCategory(created.category)
        setEditTags('')
        setEditContent('')
    }

    const saveNote = async () => {
        if (!selectedNote) return
        setIsSaving(true)

        // Convert text to Sanity block structure
        const paragraphs = editContent.split('\n\n')
        const blocks = paragraphs.map((para, idx) => ({
            _key: `block-${idx}`,
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: para, marks: [] }]
        }))

        await client.patch(selectedNote._id).set({
            title: editTitle,
            category: editCategory,
            content: blocks,
            tags: editTags.split(',').map(t => t.trim()).filter(t => t)
        }).commit()

        await fetchNotes()
        setIsEditing(false)
        setIsSaving(false)
    }

    const publishNote = async () => {
        if (!selectedNote) return
        setIsSaving(true)

        await client.patch(selectedNote._id).set({
            isPublished: true
        }).commit()

        await fetchNotes()
        setIsSaving(false)
    }

    const unpublishNote = async () => {
        if (!selectedNote) return
        setIsSaving(true)

        await client.patch(selectedNote._id).set({
            isPublished: false
        }).commit()

        await fetchNotes()
        setIsSaving(false)
    }

    const deleteNote = async (id: string) => {
        if (confirm('Delete this note? This cannot be undone.')) {
            await client.delete(id)
            await fetchNotes()
            if (selectedNote?._id === id) setSelectedNote(null)
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'plot': return '📜'
            case 'npc': return '👤'
            case 'location': return '🗺️'
            case 'session': return '⚔️'
            case 'lore': return '📖'
            default: return '📝'
        }
    }

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'plot': return 'Plot Idea'
            case 'npc': return 'NPC Concept'
            case 'location': return 'Location'
            case 'session': return 'Session Plan'
            case 'lore': return 'Lore Entry'
            default: return 'Miscellaneous'
        }
    }

    const filteredNotes = filterCategory === 'all'
        ? notes
        : notes.filter(n => n.category === filterCategory)

    // Extract text from content blocks for editing
    const getTextFromBlocks = (blocks: any[]) => {
        if (!blocks) return ''
        return blocks.map(block =>
            block.children?.map((child: any) => child.text).join('') || ''
        ).join('\n\n')
    }

    return (
        <main className="min-h-screen relative overflow-x-hidden p-8"
              style={{
                  // THE FLOOR: A dark stone or wood below the table
                  backgroundColor: '#120b06',
                  backgroundImage: `
                linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px), url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
                  backgroundSize: '80px 100%, auto',
              }}>

            {/* THE ACTUAL TABLE: Centered container with edges */}
            <div
                className="relative min-h-[calc(100vh-4rem)] mx-auto rounded-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border-[10px] border-[#2c1a0f]"
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

                {/* 1. WARM CANDLE LIGHT (Updated position to top-right) */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-[10px] bg-[radial-gradient(circle_at_85%_15%,rgba(255,180,100,0.15)_0%,rgba(0,0,0,0.2)_100%)]"/>

                {/* 2. THE REALISTIC, ANGLED CANDLE (Top Right) */}
                <div
                    /* CHANGED: Changed -top-5 to top-10 to bring it DOWN onto the wood */
                    className="absolute top-5 right-10 w-48 h-64 opacity-95 pointer-events-none select-none hidden xl:block"
                    style={{
                        perspective: '1000px',
                        zIndex: 20,
                    }}
                >
                    {/* Rotation Wrapper: Everything inside here tilts together */}
                    <div className="w-full h-full relative"
                         style={{
                             transform: 'rotateX(15deg) rotateY(-5deg) rotateZ(5deg)',
                             transformStyle: 'preserve-3d',
                         }}
                    >
                        {/* 1. THE CAST SHADOW: Now moves WITH the candle rotation */}
                        <div
                            className="absolute bottom-30 left-4/5 w-16 h-32 bg-black/60 blur-xl origin-bottom"
                            style={{
                                // rotateX(80deg) lays the shadow flat on the table relative to the candle
                                transform: 'translateX(-120%) rotateX(20deg) skewX(-20deg)',
                            }}
                        />

                        {/* 2. THE CONTACT SHADOW: Dark spot right at the base */}
                        <div
                            className="absolute bottom-17 left-1/2 -translate-x-1/2 w-20 h-8 bg-black/90 blur-sm rounded-full"/>

                        {/* 3. THE CANDLE IMAGE */}
                        <img
                            src="/images/textures/dnd-candle.webp"
                            alt="DM Candle"
                            className="relative z-10 w-full h-auto object-contain"
                            style={{
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />

                        {/* 4. THE GLOW POOL: Underneath the candle */}
                        <div
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-40 h-24 bg-amber-900/30 blur-3xl rounded-full"/>

                        {/* 5. THE FLAME */}
                        <div
                            className="absolute top-0 left-[47%] w-4 h-6 rounded-full bg-amber-400 blur-sm animate-pulse"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #fff 10%, #fbbf24 50%, #f97316 100%)',
                                boxShadow: '0 0 25px 8px rgba(251,191,36,0.5)',
                                transform: 'translateZ(20px)'
                            }}
                        />
                    </div>
                </div>
                <div className="relative z-10 max-w-full px-8 py-10">
                    <BackNavigation/>

                    {/* Header - Styled like a gold plaque */}
                    <div className="text-center mb-8">
                        <div className="text-amber-600 text-[10px] tracking-[0.4em] uppercase mb-2">Game Master's
                            Sanctum
                        </div>
                        <h1 className="text-6xl text-amber-400 drop-shadow-lg"
                            style={{fontFamily: 'var(--font-cinzel)', letterSpacing: '0.1em'}}>
                            The Workshop
                        </h1>
                        <div
                            className="w-64 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-3"/>
                        <p className="text-amber-700/80 text-sm mt-3 italic">Chronicle your secrets, plot your
                            schemes</p>
                    </div>

                    {/* FIXED: Increased max-width here so the "lg:col-span-2" can actually expand */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-[1800px] mx-auto">

                        {/* Sidebar - Notes List */}
                        <div className="lg:col-span-1">
                            <div
                                className="bg-[#2a1f12]/80 backdrop-blur-sm border border-amber-800/40 rounded-lg p-4 min-h-[100vh]">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-amber-500 text-sm font-serif uppercase tracking-wider">Your
                                        Notes</h2>
                                    <button
                                        onClick={createNewNote}
                                        className="px-3 py-1 bg-amber-700/50 hover:bg-amber-600 text-amber-100 text-xs rounded border border-amber-500/30 transition"
                                    >
                                        + New Note
                                    </button>
                                </div>

                                {/* Filter */}
                                <div className="mb-4">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full bg-[#1a1208] border border-amber-800/40 text-amber-300 text-xs rounded px-2 py-1.5"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="plot">📜 Plot Ideas</option>
                                        <option value="npc">👤 NPC Concepts</option>
                                        <option value="location">🗺️ Locations</option>
                                        <option value="session">⚔️ Session Plans</option>
                                        <option value="lore">📖 Lore Entries</option>
                                        <option value="misc">📝 Miscellaneous</option>
                                    </select>
                                </div>

                                {/* Notes List */}
                                <div className="space-y-2 h-[calc(100vh-250px)] overflow-y-auto pr-1">
                                    {isLoading ? (
                                        <p className="text-center text-amber-800/60 text-sm py-8">Loading
                                            notes...</p>
                                    ) : filteredNotes.length === 0 ? (
                                        <p className="text-center text-amber-800/60 text-sm py-8">No notes yet.
                                            Create one!</p>
                                    ) : (
                                        filteredNotes.map(note => (
                                            <div
                                                key={note._id}
                                                onClick={() => {
                                                    setSelectedNote(note)
                                                    setIsEditing(false)
                                                }}
                                                className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 ${
                                                    selectedNote?._id === note._id
                                                        ? 'bg-amber-900/40 border-amber-500'
                                                        : 'bg-amber-900/10 border-amber-800/30 hover:bg-amber-900/20'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                            <span
                                                                className="text-lg flex-shrink-0">{getCategoryIcon(note.category)}</span>
                                                        <span
                                                            className="font-serif text-amber-300 text-sm truncate">
                          {note.title}
                        </span>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        {note.isPublished && (
                                                            <span
                                                                className="text-[8px] text-emerald-600/80 bg-emerald-950/40 px-1.5 py-0.5 rounded">Published</span>
                                                        )}
                                                        {!note.isPublished && (
                                                            <span
                                                                className="text-[8px] text-amber-600/60 bg-amber-950/30 px-1.5 py-0.5 rounded">Draft</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-amber-700/60 mt-1">
                                                    {new Date(note._updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN PAPER AREA - The "Desk" surface */}
                        <div className="lg:col-span-2">
                            {selectedNote ? (
                                <div className="w-full transition-all duration-500">

                                    {/* THE PAPER */}
                                    <div
                                        className="bg-[#2a1f12]/80 backdrop-blur-sm border border-amber-800/40 rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                                        {/* Editor Header */}
                                        <div
                                            className="border-b border-amber-800/40 p-4 flex justify-between items-center flex-wrap gap-3">
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="bg-[#1a1208] border border-amber-700/50 text-amber-200 font-serif px-3 py-1.5 rounded flex-1 min-w-[150px]"
                                                        placeholder="Title"
                                                    />
                                                    <select
                                                        value={editCategory}
                                                        onChange={(e) => setEditCategory(e.target.value)}
                                                        className="bg-[#1a1208] border border-amber-700/50 text-amber-300 text-sm px-2 py-1.5 rounded"
                                                    >
                                                        <option value="plot">📜 Plot</option>
                                                        <option value="npc">👤 NPC</option>
                                                        <option value="location">🗺️ Location</option>
                                                        <option value="session">⚔️ Session</option>
                                                        <option value="lore">📖 Lore</option>
                                                        <option value="misc">📝 Misc</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={editTags}
                                                        onChange={(e) => setEditTags(e.target.value)}
                                                        placeholder="Tags (comma separated)"
                                                        className="bg-[#1a1208] border border-amber-700/50 text-amber-300 text-xs px-2 py-1.5 rounded flex-1"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                                <span
                                                                    className="text-2xl">{getCategoryIcon(selectedNote.category)}</span>
                                                            <h2 className="text-xl font-serif text-amber-300">{selectedNote.title}</h2>
                                                        </div>
                                                        <div className="text-xs text-amber-700/60 mt-1">
                                                            Created: {new Date(selectedNote._createdAt).toLocaleDateString()} •
                                                            Updated: {new Date(selectedNote._updatedAt).toLocaleString()}
                                                            {selectedNote.tags && selectedNote.tags.length > 0 && (
                                                                <span
                                                                    className="ml-2">• Tags: {selectedNote.tags.join(', ')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {/* Editor/View Toggle */}
                                                        {!isEditing && (
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditing(true)
                                                                    setEditTitle(selectedNote.title)
                                                                    setEditCategory(selectedNote.category)
                                                                    setEditTags(selectedNote.tags?.join(', ') || '')
                                                                    setEditContent(getTextFromBlocks(selectedNote.content))
                                                                }}
                                                                className="px-3 py-1 bg-amber-900/30 hover:bg-amber-800/40 text-amber-300 text-xs rounded transition"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                        )}
                                                        {selectedNote.isPublished ? (
                                                            <button onClick={unpublishNote} disabled={isSaving}
                                                                    className="px-3 py-1 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 text-xs rounded transition">📥
                                                                Unpublish</button>
                                                        ) : (
                                                            <button onClick={publishNote} disabled={isSaving}
                                                                    className="px-3 py-1 bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-300 text-xs rounded transition">📢
                                                                Publish</button>
                                                        )}
                                                        <button onClick={() => deleteNote(selectedNote._id)}
                                                                className="px-3 py-1 bg-red-900/30 hover:bg-red-800/40 text-red-300 text-xs rounded transition">🗑️
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Content Area - Your Exact Parchment Style */}
                                        <div className="p-6">
                                            {isEditing ? (
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full min-h-[120vh] p-12 text-[#3d2b1f] focus:outline-none rounded-lg"
                                                    style={{
                                                        fontFamily: 'var(--font-cursive), cursive',
                                                        fontSize: '2.5rem',
                                                        lineHeight: '2rem',
                                                        color: '#000000',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                        backgroundImage: `
                          linear-gradient(transparent 2.35rem, rgba(139, 69, 19, 0.15) 2.4rem),
                          url('/images/textures/parchment.jpg')
                        `,
                                                        backgroundSize: '100% 2.4rem, auto 99.5%',
                                                        backgroundRepeat: 'repeat, repeat',
                                                        backgroundBlendMode: 'lighten',
                                                        backgroundAttachment: 'local',
                                                        paddingTop: '7rem',
                                                        paddingLeft: '5rem',
                                                        paddingRight: '3rem',
                                                        paddingBottom: '3rem',
                                                        border: '1px solid #5c4033',
                                                        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.5)',
                                                        borderRadius: '4px'
                                                    }}
                                                    placeholder="Begin your chronicle..."
                                                />
                                            ) : (
                                                <div
                                                    className="prose prose-stone max-w-none p-12 min-h-[100vh] rounded-lg shadow-2xl border-2 border-[#5c4033]"
                                                    style={{
                                                        fontFamily: 'var(--font-cursive), cursive',
                                                        fontSize: '1.3rem',
                                                        color: '#000000',
                                                        backgroundColor: 'rgba(255, 252, 245, 0.2)',
                                                        backgroundImage: "url('/images/textures/parchment.jpg')",
                                                        backgroundSize: 'cover',
                                                        backgroundBlendMode: 'color-dodge',
                                                        paddingTop: '5rem',
                                                        paddingLeft: '5rem',
                                                        paddingRight: '3rem',
                                                        paddingBottom: '3rem',
                                                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)'

                                                    }}
                                                >
                                                    {selectedNote.content?.map((block: any, idx: number) => (
                                                        <p key={idx}
                                                           className="text-2xl leading-relaxed mb-6 drop-shadow-sm">
                                                            {block.children?.map((c: any) => c.text).join('')}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Editor Footer */}
                                        {isEditing && (
                                            <div
                                                className="border-t border-amber-800/40 p-4 flex justify-end gap-3">
                                                <button onClick={() => setIsEditing(false)}
                                                        className="px-4 py-2 border border-amber-700/50 text-amber-400 text-sm rounded hover:bg-amber-900/20 transition">Cancel
                                                </button>
                                                <button onClick={saveNote} disabled={isSaving}
                                                        className="px-4 py-2 bg-amber-700/60 hover:bg-amber-600 text-amber-100 text-sm rounded transition disabled:opacity-50">
                                                    {isSaving ? 'Saving...' : 'Save Draft'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="bg-[#2a1f12]/50 backdrop-blur-sm border border-amber-800/40 rounded-lg p-12 text-center h-[600px] flex flex-col justify-center items-center">
                                    <div className="text-6xl mb-4 opacity-30">📜</div>
                                    <h3 className="text-amber-400 font-serif text-xl mb-2">No Note Selected</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
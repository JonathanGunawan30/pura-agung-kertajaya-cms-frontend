"use client"

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import { storageApi } from "@/lib/api-client"
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon,
    Link as LinkIcon, Quote, Heading1, Heading2, Undo, Redo, Loader2
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    if (!editor) return null

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            const result = await storageApi.upload(file)
            const variants = result.variants
            const url = variants.lg || variants.md || variants.fhd || Object.values(variants)[0]

            if (url) {
                editor.chain().focus().setImage({ src: url }).run()
            }
        } catch (error) {
            console.error(error)
            alert("Gagal mengupload gambar")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const toggleAction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault()
        e.stopPropagation()
        action()
    }

    return (
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleBold().run())}
                className={cn("h-8 w-8", editor.isActive('bold') && "bg-orange-100 text-orange-600")}
            >
                <Bold className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleItalic().run())}
                className={cn("h-8 w-8", editor.isActive('italic') && "bg-orange-100 text-orange-600")}
            >
                <Italic className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-orange-100 text-orange-600")}
            >
                <Heading1 className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
                className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) && "bg-orange-100 text-orange-600")}
            >
                <Heading2 className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleBulletList().run())}
                className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-orange-100 text-orange-600")}
            >
                <List className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleOrderedList().run())}
                className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-orange-100 text-orange-600")}
            >
                <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 self-center" />

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => editor.chain().focus().toggleBlockquote().run())}
                className={cn("h-8 w-8", editor.isActive('blockquote') && "bg-orange-100 text-orange-600")}
            >
                <Quote className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost" size="icon" type="button"
                onClick={(e) => toggleAction(e, () => fileInputRef.current?.click())}
                disabled={isUploading}
                className="h-8 w-8"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </Button>

            <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" type="button" onClick={(e) => toggleAction(e, () => editor.chain().focus().undo().run())}>
                    <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" type="button" onClick={(e) => toggleAction(e, () => editor.chain().focus().redo().run())}>
                    <Redo className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                }
            }),
            ImageExtension.configure({
                allowBase64: false,
                HTMLAttributes: {
                    class: 'article-image rounded-xl border max-w-full h-auto my-6 mx-auto block shadow-md',
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-600 underline font-medium',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Mulai menulis...',
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-orange prose-sm md:prose-base max-w-none focus:outline-none min-h-[400px] p-6',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && value && editor.isEmpty && value !== "<p></p>") {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <div className="border rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all shadow-sm">
            <MenuBar editor={editor} />
            <div className="max-h-[700px] overflow-y-auto bg-background custom-editor-content">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
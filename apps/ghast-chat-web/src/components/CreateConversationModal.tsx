'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { User } from '@/types'

interface CreateConversationModalProps {
    open: boolean
    onClose: () => void
    onCreate: (conversationData: {
        name: string
        isGroup: boolean
        members: User[]
    }) => Promise<void>
    availableUsers: User[]
    currentUser: User
}

export function CreateConversationModal({
    open,
    onClose,
    onCreate,
    availableUsers,
    currentUser,
}: CreateConversationModalProps) {
    const [name, setName] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<User[]>([])
    const [isGroup, setIsGroup] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const membersToShow = useMemo(
        () => availableUsers.filter((member) => member.id !== currentUser.id),
        [availableUsers, currentUser.id]
    )

    const toggleMember = (member: User) => {
        if (selectedMembers.some((selected) => selected.id === member.id)) {
            setSelectedMembers((prev) => prev.filter((item) => item.id !== member.id))
            return
        }

        if (!isGroup && selectedMembers.length >= 1) {
            setSelectedMembers([member])
            return
        }

        setSelectedMembers((prev) => [...prev, member])
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (selectedMembers.length === 0) {
            setError('Choose at least one participant.')
            return
        }

        setError(null)
        setLoading(true)

        try {
            await onCreate({
                name: name.trim() || (isGroup ? 'New group chat' : selectedMembers[0].name),
                isGroup: isGroup || selectedMembers.length > 1,
                members: selectedMembers,
            })
            setName('')
            setSelectedMembers([])
            setIsGroup(false)
        } catch (createError) {
            setError(
                createError instanceof Error
                    ? createError.message
                    : 'Could not create conversation.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">Create new chat</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Pick members and start a private or group conversation.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-700 bg-slate-950 p-2 text-slate-300 transition hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-slate-300">
                            Conversation name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Chat name"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </label>

                        <div className="space-y-2 text-sm text-slate-300">
                            <p>Chat type</p>
                            <div className="flex items-center gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm transition hover:border-cyan-500">
                                    <input
                                        type="radio"
                                        name="chat-type"
                                        checked={!isGroup}
                                        onChange={() => setIsGroup(false)}
                                        className="h-4 w-4 text-cyan-500"
                                    />
                                    Direct chat
                                </label>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm transition hover:border-cyan-500">
                                    <input
                                        type="radio"
                                        name="chat-type"
                                        checked={isGroup}
                                        onChange={() => setIsGroup(true)}
                                        className="h-4 w-4 text-cyan-500"
                                    />
                                    Group chat
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-200">Participants</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {membersToShow.length > 0 ? (
                                membersToShow.map((member) => {
                                    const selected = selectedMembers.some((item) => item.id === member.id)
                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => toggleMember(member)}
                                            className={`flex items-center justify-between rounded-3xl border px-4 py-3 text-left transition ${selected
                                                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-100'
                                                    : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                                                }`}
                                        >
                                            <span>{member.name}</span>
                                            {selected && <Check className="h-4 w-4" />}
                                        </button>
                                    )
                                })
                            ) : (
                                <p className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-sm text-slate-500">
                                    No additional users found. Create a chat name and invite team members later.
                                </p>
                            )}
                        </div>
                    </div>

                    {error && <p className="rounded-2xl bg-red-600/20 px-4 py-3 text-sm text-red-200">{error}</p>}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-400">
                            {selectedMembers.length} selected participant{selectedMembers.length === 1 ? '' : 's'}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus className="h-4 w-4" />
                                Create chat
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

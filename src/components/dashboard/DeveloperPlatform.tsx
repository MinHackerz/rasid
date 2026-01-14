'use client';

import React, { useState, useTransition } from 'react';
import { ApiKey, createApiKey, deleteApiKey } from '@/app/actions/api-keys';
import { Button, Input, Card, CardBody as CardContent, Spinner, Badge, Modal, Select } from '@/components/ui';
import { Plus, Trash2, Copy, Terminal, Key, AlertTriangle, Check, Palette } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { INVOICE_TEMPLATES } from '@/lib/invoice-templates';

interface Props {
    initialKeys: ApiKey[];
    usageLimit: number;
    totalUsage: number;
    currentPlan: string;
}

export function DeveloperPlatform({ initialKeys, usageLimit, totalUsage, currentPlan }: Props) {
    const [keys, setKeys] = useState(initialKeys);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [isPending, startTransition] = useTransition();

    // Determine available templates based on plan
    const isBasicPlan = currentPlan === 'BASIC';
    const availableTemplates = isBasicPlan ? INVOICE_TEMPLATES.slice(0, 5) : INVOICE_TEMPLATES;

    // ... existing modal state code ...
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [keyCopied, setKeyCopied] = useState(false);

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

    const handleCreate = () => {
        // ... unchanged ...
        if (!newKeyName.trim()) return;

        startTransition(async () => {
            try {
                const result = await createApiKey(newKeyName, selectedTemplate);
                setNewKeyName('');

                if (result.key && result.apiKey) {
                    setNewlyCreatedKey(result.key);
                    setShowKeyModal(true);
                    setKeyCopied(false);
                    setKeys(prev => [result.apiKey!, ...prev]);
                }
            } catch (error) {
                toast.error("Failed to create key");
            }
        });
    };

    // ... unchanged ...
    const confirmDelete = () => {
        if (!keyToDelete) return;

        startTransition(async () => {
            await deleteApiKey(keyToDelete);
            toast.success("Key revoked");
            setKeys(prev => prev.filter(k => k.id !== keyToDelete));
            setShowDeleteModal(false);
            setKeyToDelete(null);
        });
    };

    const handleDelete = (id: string) => {
        setKeyToDelete(id);
        setShowDeleteModal(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const copyNewKey = () => {
        if (newlyCreatedKey) {
            navigator.clipboard.writeText(newlyCreatedKey);
            setKeyCopied(true);
            toast.success("API key copied to clipboard");
        }
    };

    const getTemplateName = (templateId: string) => {
        const template = INVOICE_TEMPLATES.find(t => t.id === templateId);
        return template?.name || templateId;
    };

    return (
        <div className="space-y-8 animate-enter">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">API Platform</h1>
                    <p className="text-muted-foreground mt-2">Generate API keys to integrate Rasid invoicing into your applications.</p>
                </div>
                <Link href="/dashboard/developer/docs">
                    <Button variant="outline" className="gap-2">
                        <Terminal className="w-4 h-4" />
                        API Documentation
                    </Button>
                </Link>
            </div>

            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Generate New Key</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">Total Usage:</p>
                            <Badge variant={totalUsage >= usageLimit ? 'destructive' : 'secondary'}>
                                {totalUsage.toLocaleString()} / {usageLimit > 100000 ? 'Unlimited' : usageLimit.toLocaleString()} Requests
                            </Badge>
                        </div>
                    </div>
                    <div className="grid gap-4 max-w-2xl">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Key Name</label>
                                <Input
                                    placeholder="e.g. Website Integration"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Invoice Template
                                    {isBasicPlan && <span className="text-xs text-amber-600 ml-2 font-normal">(Basic Plan: 5 templates)</span>}
                                </label>
                                <Select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    {availableTemplates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={handleCreate} disabled={isPending || !newKeyName}>
                                {isPending ? <Spinner size="sm" className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Generate Key
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                All invoices generated via this API key will use the "{getTemplateName(selectedTemplate)}" template.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your API Keys</h2>
                <div className="grid gap-4">
                    {keys.map((key) => (
                        <Card key={key.id} className="p-0 overflow-hidden">
                            <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="font-semibold text-lg">{key.name}</h3>
                                        <Badge variant={key.usage >= key.limit ? 'destructive' : 'default'}>
                                            {key.usage >= key.limit ? 'Limit Reached' : 'Active'}
                                        </Badge>
                                        <Badge variant="default" className="gap-1">
                                            <Palette className="w-3 h-3" />
                                            {getTemplateName(key.templateId)}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border/50 max-w-xl">
                                        <Key className="w-4 h-4 text-muted-foreground" />
                                        <code className="font-mono text-sm flex-1 truncate text-muted-foreground">{key.keyPreview}</code>
                                    </div>

                                    <div className="text-xs text-muted-foreground flex gap-4">
                                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                                        {key.lastUsedAt && <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(key.id)}
                                        disabled={isPending}
                                        className="gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Revoke
                                    </Button>
                                </div>
                            </div>
                            {/* Removed individual usage progress bar since usage is aggregated globally for the user based on subscription */}
                        </Card>
                    ))}

                    {keys.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Key className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No API keys found</h3>
                            <p className="max-w-xs mx-auto mt-2">Create your first API key to start generating invoices programmatically.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for showing newly created key */}
            <Modal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} title="API Key Created" size="lg">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-amber-700">Important: Save this key now!</p>
                            <p className="text-amber-600/80">This is the only time your API key will be displayed. Copy it and store it securely.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your API Key</label>
                        <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <code className="font-mono text-sm flex-1 text-emerald-400 break-all select-all">{newlyCreatedKey}</code>
                            <button
                                onClick={copyNewKey}
                                className="p-2 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
                                title="Copy to clipboard"
                            >
                                {keyCopied ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="text-muted-foreground">
                            <strong>Template:</strong> {getTemplateName(selectedTemplate)} - All invoices generated through this key will use this template style.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowKeyModal(false)}>
                            Close
                        </Button>
                        <Button onClick={copyNewKey} className="gap-2">
                            {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {keyCopied ? 'Copied!' : 'Copy Key'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal for delete confirmation */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Revoke API Key">
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold">Are you absolutely sure?</h4>
                            <p className="text-sm mt-1">
                                This action cannot be undone. Any applications using this API key will immediately stop working.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isPending}
                            className="gap-2"
                        >
                            {isPending ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                            Revoke Key
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}

'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface CodeTabsProps {
    examples: {
        [language: string]: string;
    };
    defaultLanguage?: string;
}

const languageLabels: Record<string, string> = {
    curl: 'cURL',
    javascript: 'Node.js',
    python: 'Python',
    php: 'PHP',
    go: 'Go',
    java: 'Java',
    rust: 'Rust',
};

const LangIcon = ({ lang }: { lang: string }) => {
    switch (lang) {
        case 'curl':
            return <Terminal className="w-4 h-4 text-neutral-400" />;
        case 'javascript':
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkdeKA0lb-c_MgDRWjHHYgxTlAQQ3NhjOO4g&s"
                    alt="Node.js"
                    className="w-5 h-5 object-contain"
                />
            );
        case 'python':
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg"
                    alt="Python"
                    className="w-5 h-5 object-contain"
                />
            );
        case 'php':
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src="https://www.php.net/images/logos/php-logo-white.svg"
                    alt="PHP"
                    className="w-5 h-5 object-contain brightness-0 invert-[0.6]"
                />
            );
        case 'go':
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src="https://go.dev/images/go-logo-white.svg"
                    alt="Go"
                    className="w-5 h-5 object-contain brightness-0 invert-[0.6]"
                />
            );
        default:
            return <Terminal className="w-4 h-4 text-neutral-500" />;
    }
};

export function CodeTabs({ examples, defaultLanguage = 'curl' }: CodeTabsProps) {
    const [activeLanguage, setActiveLanguage] = useState(defaultLanguage);
    const [isCopied, setIsCopied] = useState(false);

    const languages = Object.keys(examples);

    const handleCopy = () => {
        navigator.clipboard.writeText(examples[activeLanguage]);
        setIsCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="rounded-xl overflow-hidden border border-[#333333] bg-[#1e1e1e] shadow-xl my-6 font-sans">
            {/* VS Code Title Bar / Tabs */}
            <div className="flex items-center justify-between bg-[#252526] px-4 h-11 border-b border-[#333333]">
                {/* Traffic Lights (Mac style) */}
                <div className="flex items-center gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                </div>

                {/* Tabs Container */}
                <div className="flex-1 flex max-w-full overflow-x-auto no-scrollbar mask-gradient-right h-full items-end">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setActiveLanguage(lang)}
                            title={languageLabels[lang] || lang}
                            className={`
                                flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium transition-all duration-200 border-r border-[#1e1e1e] min-w-fit cursor-pointer
                                ${activeLanguage === lang
                                    ? 'bg-[#3c3c3c] text-white font-semibold border-t-2 border-t-[#3794ff]'
                                    : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#323232] border-t-2 border-t-transparent hover:text-[#cccccc]'
                                }
                            `}
                        >
                            {/* Language Icon */}
                            <LangIcon lang={lang} />
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-2 py-1 ml-2 text-xs text-[#ccccc7] hover:bg-[#3e3e42] rounded transition-colors"
                    aria-label="Copy code"
                >
                    {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>

            {/* Code Content */}
            <div className="relative group">
                <pre className="p-5 overflow-x-auto text-[13.5px] font-mono leading-relaxed text-[#ce9178] custom-scrollbar bg-[#1e1e1e]">
                    <code>{examples[activeLanguage]}</code>
                </pre>
            </div>
        </div>
    );
}

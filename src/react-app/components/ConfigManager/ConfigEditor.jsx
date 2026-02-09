import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Cog,
    Terminal,
    Search,
    FileText,
    CheckSquare,
    Folder,
    Globe,
    Cloud,
    Calculator,
    Database,
    Mail,
    Server,
    Route,
    CheckCircle,
    XCircle,
    PlusCircle,
    Save,
    Download,
    Undo,
    Trash2,
    ArrowUp,
    ArrowDown,
    Plus,
    FilePlus,
    Cpu,
    Settings,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Shield
} from 'lucide-react';
import { FieldGroup } from './Fields';
import { PermissionBadge, TopLevelIcon, SaveIndicator, ToolIcon } from './Helpers';

// Default configuration
const defaultConfig = {
    tool_paths: [],
    mcp_servers: [],
    enabled_tools: [],
    disabled_tools: [],
    skill_paths: [],
    tools: {
        bash: {
            permission: "always",
            max_output_bytes: 16000,
            default_timeout: 30,
            allowlist: [
                "echo", "find", "git diff", "git log", "git status", "tree",
                "whoami", "cat", "file", "head", "ls", "pwd", "stat", "tail",
                "uname", "wc", "which"
            ],
            denylist: [
                "gdb", "pdb", "passwd", "nano", "vim", "vi", "emacs",
                "bash -i", "sh -i", "zsh -i", "fish -i", "dash -i",
                "screen", "tmux"
            ],
            denylist_standalone: [
                "python", "python3", "ipython", "bash", "sh", "nohup",
                "vi", "vim", "emacs", "nano", "su"
            ],
        },
        grep: {
            permission: "always",
            allowlist: [],
            denylist: [],
            max_output_bytes: 64000,
            default_max_matches: 100,
            default_timeout: 60,
            exclude_patterns: [
                ".venv/", "venv/", ".env/", "env/", "node_modules/",
                ".git/", "__pycache__/", ".pytest_cache/", ".mypy_cache/",
                ".tox/", ".nox/", ".coverage/", "htmlcov/", "dist/",
                "build/", ".idea/", ".vscode/", "*.egg-info", "*.pyc",
                "*.pyo", "*.pyd", ".DS_Store", "Thumbs.db"
            ],
            codeignore_file: ".intellideskignore"
        },
        search_replace: {
            permission: "always",
            allowlist: [],
            denylist: [],
            max_content_size: 100000,
            create_backup: false,
            fuzzy_threshold: 0.9
        },
        todo: {
            permission: "always",
            allowlist: [],
            denylist: [],
            max_todos: 100
        },
        write_file: {
            permission: "always",
            allowlist: [],
            denylist: [],
            max_write_bytes: 64000,
            create_parent_dirs: true
        },
        read_file: {
            permission: "always",
            allowlist: [],
            denylist: [],
            max_read_bytes: 64000,
            max_state_history: 10
        },
        search_web: {
            permission: "ask",
            max_results: 5,
            timeout: 10,
            safe_search: true
        },
        get_weather: {
            permission: "ask",
            default_unit: "celsius",
            cache_duration: 300,
            api_timeout: 5
        },
        calculate: {
            permission: "always",
            max_expression_length: 100,
            max_precision: 10,
            allow_complex_numbers: false
        },
        file_operations: {
            max_recurse_depth: 30,
            permission: "ask",
            allowlist: ["read", "list", "copy", "stats", "exists", "read_dir"],
            denylist: ["delete", "write", "move"],
            max_file_size: 1048576,
            safe_paths: ["/home", "/tmp", "/var/tmp"]
        },
        database_query: {
            permission: "never",
            max_rows: 100,
            timeout: 15
        },
        send_message: {
            permission: "ask",
            max_message_length: 500,
            allowed_types: ["text", "email", "sms"]
        }
    },
};

const ConfigEditor = () => {
    const [config, setConfig] = useState({});
    const [selectedTool, setSelectedTool] = useState(null);
    const [selectedTopLevel, setSelectedTopLevel] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [saveIndicator, setSaveIndicator] = useState(false);
    const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'json'

    // Initialize with first tool
    useEffect(() => {
        if(!config) LoadConfig()

        if (Object.keys(config.tools).length > 0 && !selectedTool && !selectedTopLevel) {
            setSelectedTool(Object.keys(config.tools)[0]);
        }
    }, []);

    const LoadConfig = useCallback(async () => {
        const config = window.api.desk.agent.config
        if (!config) return
        setConfig(config)
    })

    const handleUpdateField = (path, value) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            let current = newConfig;

            // Navigate to the correct nested property
            const parts = path.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }

            // Update the value
            current[parts[parts.length - 1]] = value;
            return newConfig;
        });

        showSaveIndicator();
    };

    const handleRenameField = (oldPath, newName) => {
        if (!newName.trim()) return;

        setConfig(prev => {
            const newConfig = { ...prev };
            const parts = oldPath.split('.');
            let current = newConfig;

            // Navigate to parent
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }

            // Rename the field
            const oldKey = parts[parts.length - 1];
            current[newName] = current[oldKey];
            delete current[oldKey];

            return newConfig;
        });

        showSaveIndicator();
    };

    const handleDeleteField = (path) => {
        if (!window.confirm('Are you sure you want to delete this field?')) return;

        setConfig(prev => {
            const newConfig = { ...prev };
            const parts = path.split('.');
            let current = newConfig;

            // Navigate to parent
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }

            // Delete the field
            delete current[parts[parts.length - 1]];
            return newConfig;
        });

        showSaveIndicator();
    };

    const showSaveIndicator = () => {
        setSaveIndicator(true);
        setTimeout(() => setSaveIndicator(false), 3000);
    };

    const handleAddTool = () => {
        const toolName = prompt('Enter tool name (lowercase, no spaces):');
        if (!toolName) return;

        setConfig(prev => ({
            ...prev,
            tools: {
                ...prev.tools,
                [toolName]: {
                    permission: "ask",
                    description: `Configuration for ${toolName}`
                }
            }
        }));

        setSelectedTool(toolName);
        setSelectedTopLevel(null);
        showSaveIndicator();
    };

    const handleAddField = (toolName) => {
        const fieldName = prompt('Enter field name:');
        if (!fieldName) return;

        const fieldType = prompt('Field type (text/number/boolean/array):', 'text');
        let defaultValue;

        switch (fieldType) {
            case 'number': defaultValue = 0; break;
            case 'boolean': defaultValue = false; break;
            case 'array': defaultValue = []; break;
            default: defaultValue = '';
        }

        setConfig(prev => ({
            ...prev,
            tools: {
                ...prev.tools,
                [toolName]: {
                    ...prev.tools[toolName],
                    [fieldName]: defaultValue
                }
            }
        }));

        showSaveIndicator();
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset to defaults?')) {
            setConfig(defaultConfig);
            setSelectedTool(Object.keys(defaultConfig.tools)[0]);
            setSelectedTopLevel(null);
            showSaveIndicator();
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderToolEditor = (toolName) => {
        const tool = config.tools[toolName];
        if (!tool) return null;

        // Categorize fields
        const sections = {
            'Basic Settings': {},
            'Permissions & Security': {},
            'Limits & Constraints': {},
            'Lists & Arrays': {},
            'Advanced Settings': {}
        };

        Object.entries(tool).forEach(([field, value]) => {
            if (field.includes('permission') || field.includes('allow') || field.includes('deny')) {
                sections['Permissions & Security'][field] = value;
            } else if (field.includes('max') || field.includes('timeout') || field.includes('limit')) {
                sections['Limits & Constraints'][field] = value;
            } else if (Array.isArray(value)) {
                sections['Lists & Arrays'][field] = value;
            } else if (typeof value === 'boolean' || field.includes('create') || field.includes('safe')) {
                sections['Advanced Settings'][field] = value;
            } else {
                sections['Basic Settings'][field] = value;
            }
        });

        const formatToolName = (name) => {
            return name.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <ToolIcon toolName={toolName} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatToolName(toolName)} Configuration
                        </h2>
                    </div>
                    <PermissionBadge permission={tool.permission} />
                </div>

                {Object.entries(sections).map(([sectionName, fields]) => {
                    if (Object.keys(fields).length === 0) return null;

                    const isExpanded = expandedSections[sectionName] !== false;

                    return (
                        <div key={sectionName} className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
                            <button
                                onClick={() => toggleSection(sectionName)}
                                className="flex justify-between items-center w-full mb-4"
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {sectionName}
                                    </h3>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {Object.keys(fields).length} fields
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(fields).map(([field, value]) => (
                                        <FieldGroup
                                            key={field}
                                            field={field}
                                            value={value}
                                            onUpdate={(newValue) => handleUpdateField(`tools.${toolName}.${field}`, newValue)}
                                            onRename={(oldName, newName) => handleRenameField(`tools.${toolName}.${oldName}`, newName)}
                                            onDelete={() => handleDeleteField(`tools.${toolName}.${field}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handleAddField(toolName)}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add New Field
                    </button>
                    <button
                        onClick={() => showSaveIndicator()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        );
    };

    const renderTopLevelEditor = (itemId) => {
        const items = config[itemId];
        const formatName = (name) => {
            return name.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        const handleAddItem = () => {
            const newItem = prompt('Enter new item:');
            if (newItem !== null) {
                setConfig(prev => ({
                    ...prev,
                    [itemId]: [...prev[itemId], newItem]
                }));
                showSaveIndicator();
            }
        };

        const handleUpdateItem = (index, value) => {
            const newItems = [...items];
            newItems[index] = value;
            setConfig(prev => ({ ...prev, [itemId]: newItems }));
            showSaveIndicator();
        };

        const handleRemoveItem = (index) => {
            const newItems = items.filter((_, i) => i !== index);
            setConfig(prev => ({ ...prev, [itemId]: newItems }));
            showSaveIndicator();
        };

        const handleMoveItem = (index, direction) => {
            if ((index === 0 && direction === -1) || (index === items.length - 1 && direction === 1)) {
                return;
            }

            const newItems = [...items];
            const newIndex = index + direction;
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
            setConfig(prev => ({ ...prev, [itemId]: newItems }));
            showSaveIndicator();
        };

        return (
            <div className="fixed z-[99] space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700 overflow-auto">
                    <div className="flex items-center gap-3">
                        <TopLevelIcon itemId={itemId} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatName(itemId)}
                        </h2>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                        {items.length} items
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Items</h3>
                        <button
                            onClick={handleAddItem}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Folder size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No items yet. Add your first item to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleUpdateItem(index, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                    />
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMoveItem(index, -1)}
                                            disabled={index === 0}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUp size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleMoveItem(index, 1)}
                                            disabled={index === items.length - 1}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDown size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={showSaveIndicator}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        );
    };

    const renderJSONView = () => {
        const formatJSON = (obj, indent = 0) => {
            if (typeof obj !== 'object' || obj === null) {
                return <span className="text-emerald-600 dark:text-emerald-400">"{obj}"</span>;
            }

            if (Array.isArray(obj)) {
                return (
                    <span>
                        [<br />
                        {obj.map((item, idx) => (
                            <div key={idx} className="ml-8">
                                {formatJSON(item, indent + 1)}
                                {idx < obj.length - 1 ? ',' : ''}
                            </div>
                        ))}
                        <br />
                        {Array(indent * 2).fill('\u00A0').join('')}]
                    </span>
                );
            }

            const entries = Object.entries(obj);
            return (
                <span>
                    {'{'}<br />
                    {entries.map(([key, value], idx) => (
                        <div key={key} className="ml-8">
                            <span className="text-indigo-600 dark:text-indigo-400">"{key}"</span>
                            : {formatJSON(value, indent + 1)}
                            {idx < entries.length - 1 ? ',' : ''}
                        </div>
                    ))}
                    <br />
                    {Array(indent * 2).fill('\u00A0').join('')}{'}'}
                </span>
            );
        };

        return (
            <div className="bg-gray-900 text-gray-100 p-6 rounded-xl font-mono text-sm overflow-auto max-h-[500px]">
                <pre>{formatJSON(config)}</pre>
            </div>
        );
    };

    const topLevelItems = [
        { id: 'tool_paths', name: 'Tool Paths' },
        { id: 'mcp_servers', name: 'MCP Servers' },
        { id: 'skill_paths', name: 'Skill Paths' },
        { id: 'enabled_tools', name: 'Enabled Tools' },
        { id: 'disabled_tools', name: 'Disabled Tools' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                        Configuration Editor
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Edit field names and values with an elegant, user-friendly interface
                    </p>
                </header>

                {/* Main Editor */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <Settings className="text-indigo-500 dark:text-indigo-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Tools Configuration
                                </h3>
                            </div>

                            <div className="space-y-2 mb-6">
                                {topLevelItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedTopLevel(item.id);
                                            setSelectedTool(null);
                                        }}
                                        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${selectedTopLevel === item.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <TopLevelIcon itemId={item.id} />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${selectedTopLevel === item.id
                                            ? 'bg-white/20'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            {config[item.id].length}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    TOOLS
                                </h4>
                                <div className="space-y-2">
                                    {Object.keys(config.tools).map(toolName => (
                                        <button
                                            key={toolName}
                                            onClick={() => {
                                                setSelectedTool(toolName);
                                                setSelectedTopLevel(null);
                                            }}
                                            className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${selectedTool === toolName
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ToolIcon toolName={toolName} />
                                                <span>{toolName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                            </div>
                                            <PermissionBadge permission={config.tools[toolName].permission} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddTool}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                            >
                                <PlusCircle size={18} />
                                Add New Tool
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                            {/* View Mode Toggle */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <div className="flex">
                                    <button
                                        onClick={() => setViewMode('editor')}
                                        className={`flex-1 py-3 text-center font-medium ${viewMode === 'editor'
                                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Cog size={18} />
                                            Editor
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('json')}
                                        className={`flex-1 py-3 text-center font-medium ${viewMode === 'json'
                                            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText size={18} />
                                            JSON View
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-6">
                                {viewMode === 'json' ? (
                                    renderJSONView()
                                ) : (
                                    <>
                                        {selectedTool ? (
                                            renderToolEditor(selectedTool)
                                        ) : selectedTopLevel ? (
                                            renderTopLevelEditor(selectedTopLevel)
                                        ) : (
                                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                <Cog size={64} className="mx-auto mb-4 opacity-30" />
                                                <h3 className="text-xl font-medium mb-2">Select a Configuration</h3>
                                                <p>Choose a tool or configuration section from the sidebar to begin editing</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Undo size={18} />
                                Reset to Defaults
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                            >
                                <Download size={18} />
                                Export Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Indicator */}
            <SaveIndicator show={saveIndicator} />
        </div>
    );
};

export default ConfigEditor;

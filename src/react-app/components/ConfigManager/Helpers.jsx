import {
    CheckCircle,
    Terminal,
    Search,
    FileText,
    CheckSquare,
    FilePlus,
    Globe,
    Cloud,
    Calculator,
    Folder,
    Database,
    Mail
} from "lucide-react";

// Helper components
export const PermissionBadge = ({ permission }) => {
    const styles = {
        always: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
        ask: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        never: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[permission]}`}>
            {permission}
        </span>
    );
};



export const ToolIcon = ({ toolName }) => {
    const icons = {
        bash: Terminal,
        grep: Search,
        search_replace: FileText,
        todo: CheckSquare,
        write_file: FilePlus,
        read_file: FileText,
        search_web: Globe,
        get_weather: Cloud,
        calculate: Calculator,
        file_operations: Folder,
        database_query: Database,
        send_message: Mail
    };

    const Icon = icons[toolName] || Cog;
    return <Icon className="text-indigo-500 dark:text-indigo-400" size={20} />;
};

export const TopLevelIcon = ({ itemId }) => {
    const icons = {
        tool_paths: Folder,
        mcp_servers: Server,
        skill_paths: Route,
        enabled_tools: CheckCircle,
        disabled_tools: XCircle
    };

    const Icon = icons[itemId] || Cog;
    return <Icon className="text-indigo-500 dark:text-indigo-400" size={20} />;
};

export const SaveIndicator = ({ show }) => (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg transition-all duration-300 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CheckCircle size={20} />
        <span>Configuration saved successfully!</span>
    </div>
);

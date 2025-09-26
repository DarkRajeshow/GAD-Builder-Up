import { JSX, useEffect, useState, useCallback, useMemo } from "react";
import useAppStore from "@/store/useAppStore";
import { useSearchAndFilter } from "../hooks/useSearchAndFilter";
import { ViewMode, SearchFilters } from "../types/home.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Grid2X2,
    List,
    Plus,
    Search,
    Filter,
    X,
    Calendar,
    Tag,
    SortAsc,
    SortDesc,
    Eye,
    Archive,
    Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { UnifiedCard } from "./UnifiedCard";

interface QuickAction {
    id: string;
    label: string;
    icon: JSX.Element;
    action: () => void;
    gradient: string;
}

function HomePage(): JSX.Element {
    const navigate = useNavigate();
    const {
        fetchRecentDesigns,
        fetchRecentProjects,
        recentDesigns,
        recentProjects,
        recentDesignLoading,
        recentProjectLoading
    } = useAppStore();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>({
        layout: 'grid',
        itemsPerRow: 3
    });
    const [searchFocused, setSearchFocused] = useState(false);
    const [activeQuickFilter, setActiveQuickFilter] = useState<string>('');
    const [showQuickActions, setShowQuickActions] = useState(false);

    // Initialize search and filter functionality
    const {
        filters,
        filteredItems,
        categories,
        showFilterPanel,
        updateFilters,
        resetFilters,
        toggleFilterPanel,
        totalCount,
        originalCount
    } = useSearchAndFilter(recentDesigns, recentProjects);

    useEffect(() => {
        fetchRecentDesigns();
        fetchRecentProjects();
    }, [fetchRecentDesigns, fetchRecentProjects]);

    const handleItemSelect = useCallback((id: string) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            }
            return [...prev, id];
        });
    }, []);

    const handleCreateNew = useCallback(() => {
        navigate('/new-project');
    }, [navigate]);

    const toggleViewMode = () => {
        setViewMode(prev => ({
            ...prev,
            layout: prev.layout === 'grid' ? 'list' : 'grid'
        }));
    };

    const handleGridSizeChange = (size: 2 | 3 | 4) => {
        setViewMode(prev => ({
            ...prev,
            itemsPerRow: size
        }));
    };

    // Quick filter presets
    const quickFilters = useMemo(() => [
        // { id: 'recent', label: 'Recent', dateRange: 'week' as const },
        { id: 'designs', label: 'Designs', type: 'design' as const },
        { id: 'projects', label: 'Projects', type: 'project' as const },
        { id: 'today', label: 'Today', dateRange: 'today' as const }
    ], []);

    const handleQuickFilter = (filterId: string) => {
        const filter = quickFilters.find(f => f.id === filterId);
        if (filter) {
            if (activeQuickFilter === filterId) {
                resetFilters();
                setActiveQuickFilter('');
            } else {
                updateFilters({
                    type: filter.type || 'all',
                    dateRange: filter.dateRange || 'all'
                });
                setActiveQuickFilter(filterId);
            }
        }
    };

    // Quick actions
    const quickActions: QuickAction[] = useMemo(() => [
        // {
        //     id: 'new-design',
        //     label: 'New Design',
        //     icon: <Sparkles className="w-4 h-4" />,
        //     action: () => navigate('/new-design'),
        //     gradient: 'from-purple-500 to-pink-500'
        // },
        {
            id: 'new-project',
            label: 'New Project',
            icon: <Plus className="w-4 h-4" />,
            action: handleCreateNew,
            gradient: 'from-blue-500 to-cyan-500'
        },
        // {
        //     id: 'templates',
        //     label: 'Templates',
        //     icon: <Archive className="w-4 h-4" />,
        //     action: () => navigate('/templates'),
        //     gradient: 'from-green-500 to-emerald-500'
        // },
        // {
        //     id: 'analytics',
        //     label: 'Analytics',
        //     icon: <TrendingUp className="w-4 h-4" />,
        //     action: () => navigate('/analytics'),
        //     gradient: 'from-orange-500 to-red-500'
        // }
    ], [handleCreateNew]);

    const renderContent = () => {
        if (recentDesignLoading || recentProjectLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse" style={{ animationDelay: '0.15s' }}></div>
                    </div>
                    <span className="ml-4 text-gray-600 font-medium">Loading your workspace...</span>
                </div>
            );
        }

        if (!filteredItems.length) {
            if (originalCount === 0) {
                return (
                    <EmptyState
                        type="no-data"
                        title="Welcome to your workspace!"
                        description="Start creating amazing designs and projects"
                        // actionLabel="Create project"
                        onAction={handleCreateNew}
                    />
                );
            }
            return (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                    <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="hover:bg-gray-50 transition-colors"
                    >
                        Clear all filters
                    </Button>
                </div>
            );
        }

        const gridCols = viewMode.layout === 'grid'
            ? `grid-cols-${viewMode.itemsPerRow}`
            : 'grid-cols-1';

        return (
            <div className={`grid gap-6 ${gridCols} transition-all duration-300 ease-in-out`}>
                {filteredItems.map((item, index) => (
                    <div
                        key={item._id} style={{
                            animationDelay: `${index * 50}ms`
                        }}
                    >
                        <UnifiedCard
                            key={item._id}
                            item={item}
                            onSelect={() => handleItemSelect(item._id)}
                            isSelected={selectedItems.includes(item._id)}
                            viewMode={viewMode}
                        />
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div className="min-h-screen max-w-7xl px-4 mx-auto">
            {/* Floating Quick Actions */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <div className={`mb-4`}>
                    {showQuickActions && quickActions.map((action, index) => (
                        <div
                            key={action.id}
                            className="transform transition-all duration-300 w-auto"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: showQuickActions ? 'slideInUp 0.3s ease-out forwards' : ''
                            }}
                        >
                            <Button
                                onClick={action.action}
                                className={`bg-gradient-to-r ${action.gradient} text-white border-0 min-w-[160px]`}
                                size="sm"
                            >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                            </Button>
                        </div>
                    ))}
                </div>

                {/* <Button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className={`bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-xl transform transition-all duration-200 ${showQuickActions ? 'rotate-45' : 'hover:scale-110'} rounded-full w-14 h-14 p-0`}
                >
                    <Plus className="w-6 h-6" />
                </Button> */}
            </div>

            <div className="mx-auto px-6 pt-8 pb-20">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200/50">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {totalCount} {totalCount === 1 ? 'item' : 'items'} found
                                </span>
                                {originalCount > totalCount && (
                                    <span className="text-xs text-gray-500">
                                        of {originalCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                                <Button
                                    onClick={toggleViewMode}
                                    variant={viewMode.layout === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="px-3 transition-all duration-200"
                                >
                                    <Grid2X2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={toggleViewMode}
                                    variant={viewMode.layout === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="px-3 transition-all duration-200"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Grid Size Selector */}
                            {viewMode.layout === 'grid' && (
                                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                                    {[2, 3, 4].map((size) => (
                                        <Button
                                            key={size}
                                            onClick={() => handleGridSizeChange(size as 2 | 3 | 4)}
                                            variant={viewMode.itemsPerRow === size ? 'default' : 'ghost'}
                                            size="sm"
                                            className="px-3 text-xs transition-all duration-200"
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Filter Pills */}
                    <div className="flex items-center space-x-3 mb-6">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Quick filters:</span>
                        <div className="flex space-x-2">
                            {quickFilters.map((filter) => (
                                <Button
                                    key={filter.id}
                                    onClick={() => handleQuickFilter(filter.id)}
                                    variant={activeQuickFilter === filter.id ? 'default' : 'outline'}
                                    size="sm"
                                    className={`transition-all duration-200 ${activeQuickFilter === filter.id
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                                        : 'hover:shadow-sm hover:border-blue-300'
                                        }`}
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                        <div className="flex items-center space-x-4 mb-4">
                            {/* Search Input */}
                            <div className={`relative flex-1 transition-all duration-300`}>
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${searchFocused ? 'text-blue-600' : 'text-gray-400'}`} />
                                <Input
                                    placeholder="Search designs and projects..."
                                    value={filters.searchQuery}
                                    onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className={`pl-10 pr-4 py-3 text-base transition-all duration-200 border-2`}
                                />
                                {filters.searchQuery && (
                                    <Button
                                        onClick={() => updateFilters({ searchQuery: '' })}
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Filter Toggle */}
                            <Button
                                onClick={toggleFilterPanel}
                                variant={showFilterPanel ? 'default' : 'outline'}
                                className={`transition-all duration-200 ${showFilterPanel
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                                    : 'hover:shadow-sm hover:border-purple-300'
                                    }`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {Object.values(filters).some(v => v !== '' && v !== 'all' && v !== 'desc' && v !== 'date') && (
                                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </Button>
                        </div>

                        {/* Expandable Filter Panel */}
                        <div className={`transition-all duration-300 overflow-hidden ${showFilterPanel ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Tag className="w-4 h-4 inline mr-1" />
                                            Type
                                        </label>                                        <select
                                            value={filters.type}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilters({ type: e.target.value as 'all' | 'design' | 'project' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="design">Designs</option>
                                            <option value="project">Projects</option>
                                        </select>
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Archive className="w-4 h-4 inline mr-1" />
                                            Category
                                        </label>
                                        <select
                                            value={filters.category}
                                            onChange={(e) => updateFilters({ category: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label} {cat.count && `(${cat.count})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Range Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date Range
                                        </label>                                        
                                        <select
                                            value={filters.dateRange}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilters({ dateRange: e.target.value as SearchFilters['dateRange'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="year">This Year</option>
                                        </select>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4 inline mr-1" /> : <SortDesc className="w-4 h-4 inline mr-1" />}
                                            Sort By
                                        </label>
                                        <div className="flex space-x-2">                                            <select
                                            value={filters.sortBy}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="date">Date</option>
                                            <option value="name">Name</option>
                                            <option value="type">Type</option>
                                            <option value="category">Category</option>
                                        </select>
                                            <Button
                                                onClick={() => updateFilters({
                                                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                                                })}
                                                variant="outline"
                                                size="sm"
                                                className="px-3 hover:bg-gray-50"
                                            >
                                                {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-sm text-gray-500">
                                        {totalCount !== originalCount && (
                                            <span>Showing {totalCount} of {originalCount} items</span>
                                        )}
                                    </div>
                                    <Button
                                        onClick={resetFilters}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear all
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selection Actions */}
                {selectedItems.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
                        <span className="text-sm font-medium text-blue-800">
                            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                                Export
                            </Button>
                            <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                                Archive
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedItems([])}
                                className="text-blue-700 hover:bg-blue-100"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="transition-all duration-500">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import filePath from '../../utils/filePath.js';
import { designTypes } from '../../constants/index.jsx';
import useAppStore from '../../store/useAppStore.js';
import { createEmptyProjectAPI, getUserAPI, logoutAPI } from '../../lib/globalAPI.js';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup,
    CommandSeparator,
} from '@/components/ui/command';
import { Switch } from '@/components/ui/switch';
import { LogOut, User, Search, Sun, Moon, Bell, Upload, ChevronDown } from 'lucide-react';
import { IUser } from '@/types/user.types.js';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface QuickAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    show: boolean;
}


const Navbar = () => {
    const { user, setUser } = useAppStore();
    const [emptyProjectData, setEmptyProjectData] = useState({
        name: "",
        type: "",
        description: ""
    });
    const [searchOpen, setSearchOpen] = useState(false);
    const { isDark, toggleTheme, isLoading } = useDarkMode();

    const location = useLocation();
    const navigate = useNavigate();

    const fetchLoggedUser = useCallback(async () => {
        try {
            const response = await getUserAPI();
            if (response.success) {
                setUser(response.user as IUser);
            }
            else {
                setUser({} as IUser);
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser]);

    const logoutUser = useCallback(async () => {
        try {
            const data = await logoutAPI();
            if (data.success) {
                setUser({} as IUser);
                toast.success("You logged out successfully.")
            }
            else {
                toast.error(data.status)
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser]);

    useEffect(() => {
        fetchLoggedUser();
    }, [location.pathname, fetchLoggedUser]);

    const isAuthenticated = user && user.username ? true : false;

    // useEffect(() => {
    //     const tempDesignInfo = designTypes[selectedDesignType]?.questions.reduce((acc, question) => {
    //         acc[question.name] = question.options[0];
    //         return acc;
    //     }, {}) || {};

    //     setDesignInfo(tempDesignInfo);
    // }, [selectedDesignType]);

    const createEmptyProject = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await createEmptyProjectAPI(emptyProjectData);

            if (data.success) {
                toast.success(data.status);
                const projectId = data.project?._id;
                navigate(`/projects/${projectId}`);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create design.');
        }
    };

    const handleProjectInputChange = (field: string, value: string) => {
        setEmptyProjectData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Command palette (global search)
    const handleCommandSelect = (item: string) => {
        if (item.startsWith('/')) navigate(item);
        setSearchOpen(false);
    };

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Navigation links based on authentication
    const navLinks = [
        { label: 'Home', to: '/', show: true },
        // { label: 'Components', to: '/components', show: isAuthenticated },
        // { label: 'Admin Dashboard', to: '/admin-dashboard', show: isAuthenticated },
    ];

    // Quick actions
    const quickActions: QuickAction[] = [
        // { label: 'Upload', icon: <Upload className="w-4 h-4" />, onClick: () => toast.info('Upload coming soon!'), show: isAuthenticated },
    ];

    return (
        <>
            {/* Create Project Dialog */}
            <Dialog>
                <DialogContent className="max-w-md">
                    <DialogTitle className="text-center">Create A New Design</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to create a new design project.
                    </DialogDescription>
                    <form onSubmit={createEmptyProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={emptyProjectData.name}
                                onChange={(e) => handleProjectInputChange('name', e.target.value)}
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Project Type</Label>
                            <Select
                                value={emptyProjectData.type}
                                onValueChange={(value) => handleProjectInputChange('type', value)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(designTypes).map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Project Description</Label>
                            <Textarea
                                id="description"
                                value={emptyProjectData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleProjectInputChange('description', e.target.value)}
                                placeholder="Describe your project"
                                className="min-h-24"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full">Create Project</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>

                {/* Command Palette (Global Search) */}
                <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Quick Search" description="Search components, users, pages...">
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Navigation">
                                {navLinks.filter(link => link.show).map(link => (
                                    <CommandItem key={link.to} onSelect={() => handleCommandSelect(link.to)}>
                                        {link.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                            {isAuthenticated && (
                                <CommandGroup heading="Quick Actions">
                                    {quickActions && quickActions.filter(a => a.show).map(action => (
                                        <CommandItem key={action.label} onSelect={action.onClick}>
                                            {action.icon} {action.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                </CommandDialog>

                {/* Navbar */}
                <nav
                    className={cn(
                        'backdrop-blur-lg h-20 bg-white/70 dark:bg-dark/80 border-b border-black/10 dark:border-white/10 sticky top-0 z-50 shadow-xs transition-all',
                        'supports-[backdrop-filter]:bg-white/60',
                    )}
                    aria-label="Main navigation"
                >
                    <div className="max-w-7xl h-full mx-auto px-4 md:px-10 py-2 flex items-center justify-between gap-2">
                        {/* Left: Logo & Desktop Nav */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight select-none focus:outline-none" aria-label="Home">
                                <span className="rounded-lg bg-accent px-2 py-1 text-red-600">GB</span>
                            </Link>
                            {/* Desktop Nav Links */}
                            <div className="hidden md:flex gap-1 ml-4">
                                {navLinks.filter(link => link.show).map(link => (
                                    <Button
                                        key={link.to}
                                        variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                                        asChild
                                        className="font-medium px-4 rounded-full transition-all duration-150 focus-visible:ring-2 focus-visible:ring-purple-400"
                                    >
                                        <Link to={link.to} tabIndex={0}>{link.label}</Link>
                                    </Button>
                                ))}
                                {/* Approvals dropdown for authenticated users */}
                                {/* {isAuthenticated && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="font-medium px-4 rounded-full flex items-center gap-1">
                                                Approvals <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel>Approvals</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/approvals">All Approvals</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/approvals/pending">Pending</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/approvals/history">History</Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )} */}
                            </div>
                        </div>

                        {/* Center: Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 justify-end">
                            <Button variant="ghost" className="px-3 flex justify-between bg-accent w-[160px]" onClick={() => setSearchOpen(true)} aria-label="Open search (Ctrl+K)">
                                <div className='flex items-center gap-2'>
                                    <Search className="w-5 h-5" />
                                    <span className="hidden sm:inline">Search</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Ctrl+K</span>
                            </Button>
                        </div>

                        {/* Right: Quick Actions, Notifications, Profile, Theme Toggle */}
                        <div className="flex items-center gap-2">
                            {/* Quick Actions */}
                            {quickActions.filter(a => a.show).map(action => (
                                <Button key={action.label} variant="outline" size="icon" className="rounded-full" onClick={action.onClick} aria-label={action.label}>
                                    {action.icon}
                                </Button>
                            ))}
                            {/* Notifications */}
                            {isAuthenticated && user && (
                                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                                    <Bell className="w-5 h-5" />
                                </Button>
                            )}
                            {/* Theme Toggle (Desktop) */}
                            <div className="hidden md:flex items-center gap-1 px-2">
                                <Sun className={cn('w-5 h-5 transition-colors', !isDark ? 'text-yellow-400' : 'text-muted-foreground')} />
                                <Switch
                                    checked={isDark}
                                    onCheckedChange={() => !isLoading && isAuthenticated && toggleTheme()}
                                    aria-label="Toggle dark mode"
                                    className="mx-1"
                                    disabled={isLoading || !isAuthenticated}
                                />
                                <Moon className={cn('w-5 h-5 transition-colors', isDark ? 'text-blue-400' : 'text-muted-foreground')} />
                            </div>
                            {/* Profile Dropdown */}
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 focus-visible:ring-2 focus-visible:ring-purple-400" aria-label="User menu">
                                            <img
                                                src={`${filePath}/${user.dp}`}
                                                alt={user.username}
                                                className="h-full w-full rounded-full"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="flex justify-start gap-2">
                                            <User className="size-5" />
                                            <div className='flex flex-col'>
                                                <p className='text-sm font-medium'>{user.username}</p>
                                                <p className='text-xs text-muted-foreground'>{user.email}</p>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/profile">Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/preferences">Preferences</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logoutUser} className="text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/sign-in">Login</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link to="/sign-up">Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </Dialog>
        </>
    );
};

export default Navbar;
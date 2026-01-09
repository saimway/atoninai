import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed: boolean;
}

function SidebarItem({ icon: Icon, label, href, isCollapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link href={href} className="w-full">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <Icon size={20} />
        {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
      </motion.div>
    </Link>
  );
}

export { SidebarItem };

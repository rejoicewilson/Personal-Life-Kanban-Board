import * as DialogPrimitive from '@radix-ui/react-dialog'
import { PanelLeftClose } from 'lucide-react'
import { cn } from '@/utils/cn'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn('fixed inset-y-0 left-0 z-50 w-[88%] max-w-sm border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-soft', className)}
        {...props}
      >
        <SheetClose className="mb-6 inline-flex rounded-full p-2 hover:bg-sidebar-accent">
          <PanelLeftClose className="h-5 w-5" />
        </SheetClose>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetTrigger }

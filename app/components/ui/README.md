# UI Components Library

Полная коллекция UI компонентов на базе Radix UI для проекта resQ.

## Установленные Radix UI пакеты

```json
{
  "@radix-ui/react-tabs": "^1.1.15",
  "@radix-ui/react-switch": "^1.2.3",
  "@radix-ui/react-separator": "^1.2.3",
  "@radix-ui/react-label": "^2.2.3",
  "@radix-ui/react-select": "^2.2.3",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.2.3",
  "@radix-ui/react-popover": "^1.2.3",
  "@radix-ui/react-tooltip": "^1.2.3",
  "@radix-ui/react-scroll-area": "^1.2.3",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-slot": "^1.2.3"
}
```

## Доступные компоненты

### Базовые примитивы
- **Button** - кнопки с вариантами (default, destructive, outline, secondary, ghost, link)
- **Card** - карточки с Header, Content, Footer, Title, Description
- **Badge** - значки/метки
- **Alert** - уведомления и алерты
- **Input** - текстовые поля ввода
- **Textarea** - многострочный текст
- **Label** - метки для форм
- **Separator** - разделители
- **Checkbox** - чекбоксы
- **Aspect Ratio** - контейнер с заданным соотношением сторон

### Radix UI компоненты

#### Tabs (Вкладки)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>
</Tabs>
```

#### Switch (Переключатель)
```tsx
import { Switch } from "@/app/components/ui/switch"

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

#### Table (Таблица)
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from "@/app/components/ui/table"

<Table>
  <TableCaption>List of users</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Select (Выпадающий список)
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Dialog (Модальное окно)
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

#### Dropdown Menu (Контекстное меню)
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Popover (Всплывающее окно)
```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    Popover content here
  </PopoverContent>
</Popover>
```

#### Tooltip (Подсказка)
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Scroll Area (Прокручиваемая область)
```tsx
import { ScrollArea } from "@/app/components/ui/scroll-area"

<ScrollArea className="h-[200px] w-[350px] rounded-xl border p-4">
  {/* Long content here */}
</ScrollArea>
```

## Design Tokens

```tsx
import tokens from "@/app/components/ui/design-tokens"

// Использование токенов
const myStyle = {
  padding: tokens.spacing.md,
  borderRadius: tokens.radii.lg,
  backgroundColor: tokens.colors.primary,
  boxShadow: tokens.shadows.md,
}
```

## Специальные компоненты

### Icon (Иконка с accessibility)
```tsx
import Icon from "@/app/components/ui/Icon"

<Icon size={tokens.sizes.iconMd} color={tokens.colors.primary} label="Home icon" />
```

### CTAButton (Call-to-Action кнопка)
```tsx
import CTAButton from "@/app/components/ui/CTAButton"

<CTAButton variant="primary" size="lg">
  Get Started
</CTAButton>
```

## Импорт компонентов

Все компоненты можно импортировать через barrel export:

```tsx
import { 
  Button, 
  Card, 
  Dialog, 
  Select, 
  Tabs,
  tokens 
} from "@/app/components/ui"
```

Или индивидуально:

```tsx
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
```

## Стилизация

Все компоненты используют:
- **Tailwind CSS v4** для утилитарных классов
- **Design tokens** для консистентности
- **cn()** утилиту для объединения классов
- **CVA (class-variance-authority)** для вариантов компонентов

## Accessibility

Все Radix UI компоненты:
- ✅ Полностью доступны (ARIA-compliant)
- ✅ Поддержка клавиатурной навигации
- ✅ Screen reader friendly
- ✅ Focus management

## Цветовая схема

```tsx
colors: {
  primary: '#53B175',      // Основной зеленый
  emergency: '#00c16a',    // Emergency зеленый
  destructive: '#F87171',  // Красный для ошибок
}
```

## Spacing Strategy

- Card padding: `p-4` или `p-6`
- Section spacing: `space-y-4` или `space-y-6`
- Button height: `h-11` (default), `h-9` (sm), `h-12` (lg)
- Border radius: `rounded-xl` (12px) или `rounded-2xl` (16px)

'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Heart, 
  Phone, 
  MapPin, 
  MessageCircle,
  Navigation,
  Search,
  Plus,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'safe' | 'at-risk' | 'unknown';
  lastSeen: string;
  distance?: number;
}

const mockFamily: Contact[] = [
  {
    id: 'f1',
    name: 'Айгерим Нурланова',
    relation: 'Мать',
    phone: '+7 701 234 5678',
    location: 'Astana, Есіл район',
    coordinates: { lat: 51.1605, lng: 71.4704 },
    status: 'safe',
    lastSeen: '2 минуты назад',
    distance: 1.2,
  },
  {
    id: 'f2',
    name: 'Нурлан Ахметов',
    relation: 'Отец',
    phone: '+7 701 234 5679',
    location: 'Astana, Сарыарка район',
    coordinates: { lat: 51.1290, lng: 71.4305 },
    status: 'safe',
    lastSeen: '5 минут назад',
    distance: 3.5,
  },
  {
    id: 'f3',
    name: 'Дана Нурланова',
    relation: 'Сестра',
    phone: '+7 701 234 5680',
    location: 'Almaty, Алмалы район',
    coordinates: { lat: 43.2566, lng: 76.9286 },
    status: 'unknown',
    lastSeen: '2 часа назад',
    distance: 1052,
  },
  {
    id: 'f4',
    name: 'Ерлан Нурланов',
    relation: 'Брат',
    phone: '+7 701 234 5681',
    location: 'Astana, Алматы район',
    coordinates: { lat: 51.1180, lng: 71.3980 },
    status: 'at-risk',
    lastSeen: '30 минут назад',
    distance: 5.8,
  },
];

const mockFriends: Contact[] = [
  {
    id: 'fr1',
    name: 'Асем Сагындыкова',
    relation: 'Подруга',
    phone: '+7 702 345 6789',
    location: 'Astana, Байконур район',
    coordinates: { lat: 51.0950, lng: 71.4150 },
    status: 'safe',
    lastSeen: '10 минут назад',
    distance: 2.1,
  },
  {
    id: 'fr2',
    name: 'Тимур Жанабаев',
    relation: 'Друг',
    phone: '+7 702 345 6790',
    location: 'Astana, Есіл район',
    coordinates: { lat: 51.1550, lng: 71.4600 },
    status: 'safe',
    lastSeen: '1 час назад',
    distance: 1.8,
  },
  {
    id: 'fr3',
    name: 'Жанар Касымова',
    relation: 'Коллега',
    phone: '+7 702 345 6791',
    location: 'Astana, Сарыарка район',
    coordinates: { lat: 51.1350, lng: 71.4450 },
    status: 'unknown',
    lastSeen: '3 часа назад',
    distance: 4.2,
  },
  {
    id: 'fr4',
    name: 'Арман Бекбосынов',
    relation: 'Друг',
    phone: '+7 702 345 6792',
    location: 'Shymkent, Каратау район',
    coordinates: { lat: 42.3417, lng: 69.5901 },
    status: 'safe',
    lastSeen: '45 минут назад',
    distance: 1245,
  },
];

export default function FriendsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'family' | 'friends'>('family');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'at-risk':
        return 'bg-red-500';
      case 'unknown':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe':
        return 'В безопасности';
      case 'at-risk':
        return 'Требуется помощь';
      case 'unknown':
        return 'Статус неизвестен';
      default:
        return 'Неизвестно';
    }
  };

  const contacts = activeTab === 'family' ? mockFamily : mockFriends;
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safeCount = contacts.filter(c => c.status === 'safe').length;
  const atRiskCount = contacts.filter(c => c.status === 'at-risk').length;

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-950 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-4 relative">
            <BackButton onClick={() => router.back()} />
            <PageHeader
              title="Семья и Друзья"
              subtitle="Следите за местоположением и статусом близких во время чрезвычайных ситуаций"
              icon={<Users className="h-12 w-12 text-green-600 dark:text-green-400" />}
              bgColor="transparent"
              textColor="#16a34a"
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {safeCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  В безопасности
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {atRiskCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Требуют помощи
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {contacts.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Всего контактов
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'family' ? 'default' : 'outline'}
              onClick={() => setActiveTab('family')}
              className={activeTab === 'family' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Heart className="w-4 h-4 mr-2" />
              Семья ({mockFamily.length})
            </Button>
            <Button
              variant={activeTab === 'friends' ? 'default' : 'outline'}
              onClick={() => setActiveTab('friends')}
              className={activeTab === 'friends' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Друзья ({mockFriends.length})
            </Button>
            <Button variant="outline" size="icon" className="ml-auto">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Contacts List */}
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {contact.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {contact.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {contact.relation}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getStatusText(contact.status)} · {contact.lastSeen}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{contact.location}</span>
                        {contact.distance !== undefined && (
                          <span className="text-gray-400">· {contact.distance} км</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Позвонить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => router.push(`/forecast/map?lat=${contact.coordinates.lat}&lng=${contact.coordinates.lng}`)}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          На карте
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => router.push(`/chat`)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Написать
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredContacts.length === 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Контакты не найдены
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Попробуйте изменить запрос поиска
                </p>
              </CardContent>
            </Card>
          )}

          {/* Add Contact FAB */}
          <Button
            className="fixed bottom-20 right-4 md:right-8 w-14 h-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

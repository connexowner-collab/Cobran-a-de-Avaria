import {
  Home, BarChart3, DollarSign, Headset, MapPin, Wrench, Boxes,
  Truck, Users, HelpCircle, AlertTriangle, AlertCircle,
} from 'lucide-react';

export interface NavLeaf {
  label: string;
  href: string;
  novo?: boolean;
  /** Quando true, abre o href em nova aba (link externo). */
  externo?: boolean;
}

export interface NavItem extends NavLeaf {
  icon: React.ReactNode;
  children?: NavLeaf[];
}

export const NAV: { grupo: string; itens: NavItem[] }[] = [
  {
    grupo: 'Visão geral',
    itens: [
      { label: 'Início', href: '/portal/inicio', icon: <Home size={18} /> },
      { label: 'Modelos', href: '/portal/modelos', icon: <Boxes size={18} /> },
      {
        label: 'Relatórios', href: '/portal/relatorios', icon: <BarChart3 size={18} />,
        children: [
          { label: 'Idade da frota', href: '/portal/relatorios?aba=idade' },
          { label: 'Quilometragem', href: '/portal/relatorios?aba=km' },
          { label: 'Distribuição da frota', href: '/portal/relatorios?aba=regiao' },
        ],
      },
      { label: 'Vamos Controle', href: '/portal/vamos-controle', icon: <MapPin size={18} /> },
    ],
  },
  {
    grupo: 'Operação',
    itens: [
      { label: 'Serviços', href: '/portal/servicos', icon: <Wrench size={18} /> },
      { label: 'Central de Chamados', href: '/portal/chamados', icon: <Headset size={18} />, novo: true },
      { label: 'Veículos / CRLV', href: '/portal/veiculos', icon: <Truck size={18} /> },
    ],
  },
  {
    grupo: 'Financeiro',
    itens: [
      { label: 'Faturamento', href: '/portal/faturamento', icon: <DollarSign size={18} /> },
      { label: 'Cobrança de Avarias', href: '/portal/avarias', icon: <AlertTriangle size={18} /> },
      { label: 'Multas', href: '/portal/multas', icon: <AlertCircle size={18} /> },
    ],
  },
  {
    grupo: 'Suporte',
    itens: [
      { label: 'Central de Dúvidas', href: '/portal/central-duvidas', icon: <HelpCircle size={18} /> },
      { label: 'Administração de Acessos', href: '/gestao-usuarios', icon: <Users size={18} />, novo: true },
    ],
  },
];

export interface TelaInfo {
  href: string;
  label: string;
  icon: React.ReactNode;
  externo?: boolean;
}

/** Lista plana de todas as telas favoritáveis (itens + sub-itens herdam o ícone do pai). */
export const TELAS_PORTAL: TelaInfo[] = NAV.flatMap(({ itens }) =>
  itens.flatMap((item) => [
    { href: item.href, label: item.label, icon: item.icon, externo: item.externo },
    ...(item.children ?? []).map((c) => ({ href: c.href, label: c.label, icon: item.icon, externo: c.externo })),
  ]),
);

export function getTela(href: string): TelaInfo | undefined {
  return TELAS_PORTAL.find((t) => t.href === href);
}

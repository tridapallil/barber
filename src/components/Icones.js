const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size, children, ...props }) {
  return (
    <svg {...base} {...(size ? { width: size, height: size } : null)} {...props} aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconePainel = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="8" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="11" width="7" height="10" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

export const IconeClientes = (p) => (
  <Svg {...p}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.4" />
    <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16.5 4.2a3.4 3.4 0 0 1 0 6.1" />
  </Svg>
);

export const IconeTesoura = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="2.6" />
    <circle cx="6" cy="18" r="2.6" />
    <path d="M20 4 8.6 15.4M14.5 14.5 20 20M8.6 8.6 12 12" />
  </Svg>
);

export const IconeRelatorio = (p) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);

export const IconeBusca = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconeMais = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconeX = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const IconeLapis = (p) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
);

export const IconeLixeira = (p) => (
  <Svg {...p}>
    <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M19 6l-.8 13.1a2 2 0 0 1-2 1.9H7.8a2 2 0 0 1-2-1.9L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const IconeTelefone = (p) => (
  <Svg {...p}>
    <path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.8 1.7h2.6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.5 9.5a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.9 2.3Z" />
  </Svg>
);

export const IconeCalendario = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const IconeDinheiro = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2.5" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 12h.01M18 12h.01" />
  </Svg>
);

export const IconeVoltar = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Svg>
);

export const IconeSeta = (p) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const IconeSair = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export const IconeAlerta = (p) => (
  <Svg {...p}>
    <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const IconeCheck = (p) => (
  <Svg {...p}>
    <path d="m20 6-11 11-5-5" />
  </Svg>
);

export const IconeCadeado = (p) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconeUsuario = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </Svg>
);

export const IconeEstrela = (p) => (
  <Svg {...p}>
    <path d="M12 3.2 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9Z" />
  </Svg>
);

export const IconeTendencia = (p) => (
  <Svg {...p}>
    <path d="m3 16 5.5-5.5 3.5 3.5L21 5" />
    <path d="M15 5h6v6" />
  </Svg>
);

export const IconeEtiqueta = (p) => (
  <Svg {...p}>
    <path d="M20.6 12.6 12 21.2l-8.5-8.5V3.5h9.2l7.9 7.9a1.5 1.5 0 0 1 0 1.2Z" />
    <path d="M7.5 7.5h.01" />
  </Svg>
);

export const IconeNota = (p) => (
  <Svg {...p}>
    <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h6M8 13h8M8 17h5" />
  </Svg>
);

export const IconeClienteMais = (p) => (
  <Svg {...p}>
    <path d="M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="8.5" cy="7" r="3.4" />
    <path d="M19 7v6M22 10h-6" />
  </Svg>
);

export const IconeServicoMais = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="7" r="2.4" />
    <circle cx="6" cy="17" r="2.4" />
    <path d="M16 5 8.5 15.2M13.4 13.8 16 17M8.5 8.8 10.3 11.2" />
    <path d="M19 15v6M22 18h-6" />
  </Svg>
);

export const IconeFiltro = (p) => (
  <Svg {...p}>
    <path d="M7 4v5M7 15v5M17 4v3M17 13v7" />
    <circle cx="7" cy="12" r="2.2" />
    <circle cx="17" cy="10" r="2.2" />
  </Svg>
);

export const IconeExpandir = (p) => (
  <Svg {...p}>
    <path d="M8 16 16 8M10 8h6v6" />
  </Svg>
);

export const IconeArquivo = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const IconeBaixar = (p) => (
  <Svg {...p}>
    <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

export const IconeSubir = (p) => (
  <Svg {...p}>
    <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

export const IconeEscudo = (p) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 8.3 7 9.5 4.1-1.2 7-5.2 7-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

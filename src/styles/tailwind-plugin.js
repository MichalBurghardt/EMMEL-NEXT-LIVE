/**
 * Emmel Tailwind CSS Components Plugin
 * 
 * Ten plugin definiuje style komponentów dla aplikacji Emmel.
 * Pozwala na używanie dyrektyw @apply w bardziej zorganizowany sposób
 * zamiast używania ich bezpośrednio w plikach CSS.
 */

import plugin from 'tailwindcss/plugin';

export default plugin(function({ addComponents }) {
  // Komponenty przycisków
  const buttons = {
    '.btn': {
      '@apply inline-flex items-center justify-center px-5 py-2.5 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2': {},
      '&:disabled, &[disabled]': {
        '@apply opacity-60 cursor-not-allowed': {},
      }
    },
    '.btn-primary': {
      '@apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': {},
      '&:disabled, &[disabled]': {
        '@apply bg-primary-600 hover:bg-primary-600': {},
      }
    },
    '.btn-secondary': {
      '@apply bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600': {},
    },
    '.btn-outline': {
      '@apply border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800': {},
    },
    '.btn-danger': {
      '@apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': {},
    },
    '.btn-success': {
      '@apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500': {},
    },
    '.btn-sm': {
      '@apply px-3 py-1.5 text-sm': {},
    },
    '.btn-lg': {
      '@apply px-6 py-3 text-lg': {},
    },
    '.btn-icon': {
      '@apply p-2 rounded-full': {},
    }
  };

  // Komponenty kart
  const cards = {
    '.card': {
      '@apply bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm': {},
    },
    '.card-hover': {
      '@apply transition-shadow hover:shadow-md': {},
    },
    '.card-header': {
      '@apply px-6 py-4 border-b border-neutral-200 dark:border-neutral-700': {},
    },
    '.card-body': {
      '@apply p-6': {},
    },
    '.card-footer': {
      '@apply px-6 py-4 border-t border-neutral-200 dark:border-neutral-700': {},
    }
  };

  // Komponenty formularzy
  const forms = {
    '.form-group': {
      '@apply mb-5': {},
    },
    '.form-label': {
      '@apply block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300': {},
    },
    '.form-input': {
      '@apply block w-full px-4 py-2.5 text-neutral-900 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100': {},
      '&:disabled, &[disabled]': {
        '@apply bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed': {},
      }
    },
    '.form-select': {
      '@apply block w-full px-4 py-2.5 text-neutral-900 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100': {},
    },
    '.form-checkbox': {
      '@apply w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800': {},
    },
    '.form-radio': {
      '@apply w-5 h-5 text-primary-600 border-neutral-300 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800': {},
    },
    '.form-error': {
      '@apply mt-1 text-sm text-red-600 dark:text-red-400': {},
    },
    '.form-helper': {
      '@apply mt-1 text-sm text-neutral-500 dark:text-neutral-400': {},
    }
  };

  // Komponenty tabel
  const tables = {
    '.table': {
      '@apply w-full text-sm text-left': {},
    },
    '.table-container': {
      '@apply relative overflow-x-auto': {},
    },
    '.table thead': {
      '@apply text-xs uppercase bg-neutral-100 dark:bg-neutral-800': {},
    },
    '.table th': {
      '@apply px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300': {},
    },
    '.table td': {
      '@apply px-4 py-3 border-t dark:border-neutral-700': {},
    },
    '.table-striped tbody tr:nth-child(even)': {
      '@apply bg-neutral-50 dark:bg-neutral-800/50': {},
    },
    '.table-hover tr:hover': {
      '@apply bg-neutral-50 dark:bg-neutral-700/50': {},
    },
  };

  // Komponenty etykiet
  const badges = {
    '.badge': {
      '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
    },
    '.badge-primary': {
      '@apply bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300': {},
    },
    '.badge-secondary': {
      '@apply bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300': {},
    },
    '.badge-success': {
      '@apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': {},
    },
    '.badge-danger': {
      '@apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': {},
    },
    '.badge-warning': {
      '@apply bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300': {},
    },
    '.badge-info': {
      '@apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': {},
    },
  };

  // Komponenty alertów
  const alerts = {
    '.alert': {
      '@apply p-4 mb-4 rounded-lg': {},
    },
    '.alert-success': {
      '@apply bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400': {},
    },
    '.alert-danger': {
      '@apply bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400': {},
    },
    '.alert-warning': {
      '@apply bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': {},
    },
    '.alert-info': {
      '@apply bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': {},
    },
    '.alert-neutral': {
      '@apply bg-neutral-50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300': {},
    },
  };

  // Komponenty nawigacji
  const navigation = {
    '.nav': {
      '@apply flex flex-col space-y-1': {},
    },
    '.nav-item': {
      '@apply px-4 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800': {},
    },
    '.nav-item-active': {
      '@apply bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400': {},
    },
    '.nav-tabs': {
      '@apply flex space-x-1 border-b border-neutral-200 dark:border-neutral-700': {},
    },
    '.nav-tab': {
      '@apply px-4 py-2 text-neutral-600 dark:text-neutral-400 border-b-2 border-transparent': {},
    },
    '.nav-tab-active': {
      '@apply text-primary-600 dark:text-primary-400 border-b-2 border-primary-500': {},
    },
  };

  // Komponenty awatarów
  const avatars = {
    '.avatar': {
      '@apply relative inline-block rounded-full overflow-hidden': {},
    },
    '.avatar-sm': {
      '@apply w-8 h-8': {},
    },
    '.avatar-md': {
      '@apply w-10 h-10': {},
    },
    '.avatar-lg': {
      '@apply w-14 h-14': {},
    },
    '.avatar-group': {
      '@apply flex -space-x-2': {},
    },
    '.avatar-group .avatar': {
      '@apply ring-2 ring-white dark:ring-neutral-800': {},
    },
  };

  // Komponenty wskaźników statusu
  const statusIndicators = {
    '.status-indicator': {
      '@apply relative inline-flex h-2.5 w-2.5 rounded-full': {},
    },
    '.status-indicator-pulse': {
      '&::after': {
        '@apply absolute inline-flex h-full w-full rounded-full opacity-75 animation-bounce': {},
        'content': '""',
        'transform': 'scale(1)',
        'animation': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
    '.status-active': {
      '@apply bg-green-500': {},
      '&::after': {
        '@apply bg-green-500': {},
      }
    },
    '.status-idle': {
      '@apply bg-amber-500': {},
      '&::after': {
        '@apply bg-amber-500': {},
      }
    },
    '.status-offline': {
      '@apply bg-neutral-400': {},
    },
    '.status-busy': {
      '@apply bg-red-500': {},
      '&::after': {
        '@apply bg-red-500': {},
      }
    },
  };

  // Komponenty rozwijanych menu
  const dropdowns = {
    '.dropdown': {
      '@apply relative inline-block': {},
    },
    '.dropdown-menu': {
      '@apply absolute z-20 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none dark:ring-neutral-700': {},
    },
    '.dropdown-item': {
      '@apply block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700': {},
    },
    '.dropdown-divider': {
      '@apply border-t border-neutral-200 dark:border-neutral-700 my-1': {},
    }
  };

  // Komponenty modali
  const modals = {
    '.modal-backdrop': {
      '@apply fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity': {},
    },
    '.modal': {
      '@apply fixed inset-0 z-50 overflow-y-auto': {},
    },
    '.modal-container': {
      '@apply flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0': {},
    },
    '.modal-content': {
      '@apply relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg': {},
    },
    '.modal-header': {
      '@apply px-6 py-4 border-b border-neutral-200 dark:border-neutral-700': {},
    },
    '.modal-body': {
      '@apply p-6': {},
    },
    '.modal-footer': {
      '@apply px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-shrink-0 flex-wrap items-center justify-end space-x-2': {},
    },
    '.modal-title': {
      '@apply text-lg font-medium text-neutral-900 dark:text-neutral-100': {},
    }
  };

  // Komponenty powiadomień
  const toasts = {
    '.toast-container': {
      '@apply fixed bottom-5 right-5 z-50 space-y-3': {},
    },
    '.toast': {
      '@apply flex items-center p-4 rounded-lg shadow-md bg-white dark:bg-neutral-800 border-l-4': {},
    },
    '.toast-success': {
      '@apply border-green-500': {},
    },
    '.toast-error': {
      '@apply border-red-500': {},
    },
    '.toast-warning': {
      '@apply border-amber-500': {},
    },
    '.toast-info': {
      '@apply border-blue-500': {},
    },
  };

  // Komponenty kalendarza
  const calendar = {
    '.calendar': {
      '@apply w-full border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden': {},
    },
    '.calendar-header': {
      '@apply flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700': {},
    },
    '.calendar-grid': {
      '@apply grid grid-cols-7': {},
    },
    '.calendar-day': {
      '@apply h-24 p-1 border-t border-r border-neutral-200 dark:border-neutral-700': {},
      '&:nth-child(7n)': {
        '@apply border-r-0': {},
      }
    },
    '.calendar-day-header': {
      '@apply py-2 text-center text-sm font-medium text-neutral-700 dark:text-neutral-400': {},
    },
    '.calendar-date': {
      '@apply w-8 h-8 flex items-center justify-center rounded-full text-sm': {},
    },
    '.calendar-date-current': {
      '@apply bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300': {},
    },
    '.calendar-date-other-month': {
      '@apply text-neutral-400 dark:text-neutral-600': {},
    },
    '.calendar-event': {
      '@apply text-xs p-1 mb-1 rounded truncate': {},
    }
  };

  // Komponenty paska bocznego
  const sidebar = {
    '.sidebar': {
      '@apply flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800': {},
    },
    '.sidebar-header': {
      '@apply p-4 border-b border-neutral-200 dark:border-neutral-800': {},
    },
    '.sidebar-content': {
      '@apply flex-grow overflow-y-auto': {},
    },
    '.sidebar-footer': {
      '@apply p-4 border-t border-neutral-200 dark:border-neutral-800': {},
    },
    '.sidebar-item': {
      '@apply flex items-center px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50': {},
    },
    '.sidebar-item-active': {
      '@apply bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400': {},
    },
    '.sidebar-title': {
      '@apply px-4 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider': {},
    },
    '.sidebar-divider': {
      '@apply my-2 border-t border-neutral-200 dark:border-neutral-800': {},
    }
  };

  // Komponenty dashboardu
  const dashboard = {
    '.dashboard-grid': {
      '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6': {},
    },
    '.dashboard-stat-card': {
      '@apply flex flex-col p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700': {},
    },
    '.dashboard-stat-value': {
      '@apply text-3xl font-bold text-neutral-900 dark:text-neutral-100': {},
    },
    '.dashboard-stat-label': {
      '@apply text-sm font-medium text-neutral-500 dark:text-neutral-400': {},
    },
    '.dashboard-stat-change-positive': {
      '@apply inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400': {},
    },
    '.dashboard-stat-change-negative': {
      '@apply inline-flex items-center text-sm font-medium text-red-600 dark:text-red-400': {},
    },
  };

  // Dodaj wszystkie komponenty
  addComponents({
    ...buttons,
    ...cards,
    ...forms,
    ...tables,
    ...badges,
    ...alerts,
    ...navigation,
    ...avatars,
    ...statusIndicators,
    ...dropdowns,
    ...modals,
    ...toasts,
    ...calendar,
    ...sidebar,
    ...dashboard,
  });
});

import type { BusinessType, DataProvider, InstallState, Language } from "@/lib/types";
import { PASSWORD_MIN_LENGTH } from "@/lib/store";

export const languages: { id: Language; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
  { id: "ru", label: "Русский", flag: "🇷🇺" },
  { id: "pt", label: "Português", flag: "🇵🇹" }
];

export const businessTypes: { id: BusinessType; labelKey: "restaurant" | "cafe" }[] = [
  { id: "restaurant", labelKey: "restaurant" },
  { id: "cafe", labelKey: "cafe" }
];

export const providers: { id: DataProvider; label: string; hint: string }[] = [
  { id: "local", label: "Local storage", hint: "Works offline right away" },
  { id: "supabase", label: "Supabase", hint: "Cloud Postgres + auth" },
  { id: "firebase", label: "Firebase", hint: "Cloud Firestore + auth" }
];

export type CopyKey =
  | "appTitle"
  | "appSubtitle"
  | "brand"
  | "stepLanguage"
  | "stepBusiness"
  | "stepCredentials"
  | "stepProvider"
  | "language"
  | "businessType"
  | "restaurantName"
  | "adminUser"
  | "password"
  | "passwordHint"
  | "provider"
  | "providerReady"
  | "providerMissing"
  | "next"
  | "back"
  | "finish"
  | "installing"
  | "installed"
  | "openPanel"
  | "restart"
  | "ready"
  | "missing"
  | "restaurant"
  | "cafe";

export type Copy = Record<CopyKey, string>;

export const copy: Record<Language, Copy> = {
  en: {
    brand: "Restaurant POS by MIA Solutions",
    appTitle: "Set up Restaurant POS",
    appSubtitle: "Configure your venue with MIA Solutions Pvt. Ltd. — language, admin access, and data provider.",
    stepLanguage: "Language",
    stepBusiness: "Business",
    stepCredentials: "Credentials",
    stepProvider: "Provider",
    language: "Choose the interface language",
    businessType: "Business type",
    restaurantName: "Business name",
    adminUser: "Admin username",
    password: "Password",
    passwordHint: "At least 6 characters",
    provider: "Data provider",
    providerReady: "Ready to use",
    providerMissing: "Optional cloud keys in .env.local",
    next: "Continue",
    back: "Back",
    finish: "Launch POS",
    installing: "Setting up…",
    installed: "Restaurant POS is ready",
    openPanel: "Open dashboard",
    restart: "Reset setup",
    ready: "connected",
    missing: "local mode",
    restaurant: "Restaurant",
    cafe: "Cafe"
  },
  es: {
    brand: "Restaurant POS",
    appTitle: "Configura Restaurant POS",
    appSubtitle: "Define tu local, acceso admin y proveedor de datos en pocos pasos.",
    stepLanguage: "Idioma",
    stepBusiness: "Negocio",
    stepCredentials: "Credenciales",
    stepProvider: "Proveedor",
    language: "Elige el idioma de la interfaz",
    businessType: "Tipo de negocio",
    restaurantName: "Nombre del local",
    adminUser: "Usuario administrador",
    password: "Contraseña",
    passwordHint: "Mínimo 6 caracteres",
    provider: "Proveedor de datos",
    providerReady: "Listo para usar",
    providerMissing: "Claves cloud opcionales en .env.local",
    next: "Continuar",
    back: "Atrás",
    finish: "Abrir POS",
    installing: "Configurando…",
    installed: "Restaurant POS está listo",
    openPanel: "Abrir panel",
    restart: "Reiniciar",
    ready: "conectado",
    missing: "modo local",
    restaurant: "Restaurante",
    cafe: "Cafetería"
  },
  fr: {
    brand: "Restaurant POS",
    appTitle: "Configurer Restaurant POS",
    appSubtitle: "Configurez votre établissement, l'accès admin et le fournisseur de données.",
    stepLanguage: "Langue",
    stepBusiness: "Activité",
    stepCredentials: "Identifiants",
    stepProvider: "Fournisseur",
    language: "Choisissez la langue de l'interface",
    businessType: "Type d'activité",
    restaurantName: "Nom de l'établissement",
    adminUser: "Utilisateur admin",
    password: "Mot de passe",
    passwordHint: "Au moins 6 caractères",
    provider: "Fournisseur de données",
    providerReady: "Prêt à l'emploi",
    providerMissing: "Clés cloud optionnelles dans .env.local",
    next: "Continuer",
    back: "Retour",
    finish: "Lancer le POS",
    installing: "Configuration…",
    installed: "Restaurant POS est prêt",
    openPanel: "Ouvrir le tableau de bord",
    restart: "Réinitialiser",
    ready: "connecté",
    missing: "mode local",
    restaurant: "Restaurant",
    cafe: "Café"
  },
  zh: {
    brand: "Restaurant POS",
    appTitle: "设置 Restaurant POS",
    appSubtitle: "只需几步即可配置门店、管理员和数据提供商。",
    stepLanguage: "语言",
    stepBusiness: "业务",
    stepCredentials: "凭据",
    stepProvider: "提供商",
    language: "选择界面语言",
    businessType: "业务类型",
    restaurantName: "店铺名称",
    adminUser: "管理员用户名",
    password: "密码",
    passwordHint: "至少 6 个字符",
    provider: "数据提供商",
    providerReady: "可以使用",
    providerMissing: "可在 .env.local 配置云密钥",
    next: "继续",
    back: "返回",
    finish: "启动 POS",
    installing: "正在设置…",
    installed: "Restaurant POS 已就绪",
    openPanel: "打开控制台",
    restart: "重置设置",
    ready: "已连接",
    missing: "本地模式",
    restaurant: "餐厅",
    cafe: "咖啡馆"
  },
  ru: {
    brand: "Restaurant POS",
    appTitle: "Настройка Restaurant POS",
    appSubtitle: "Настройте заведение, доступ администратора и поставщика данных.",
    stepLanguage: "Язык",
    stepBusiness: "Бизнес",
    stepCredentials: "Учётные данные",
    stepProvider: "Поставщик",
    language: "Выберите язык интерфейса",
    businessType: "Тип бизнеса",
    restaurantName: "Название заведения",
    adminUser: "Администратор",
    password: "Пароль",
    passwordHint: "Минимум 6 символов",
    provider: "Поставщик данных",
    providerReady: "Готово к работе",
    providerMissing: "Облачные ключи опциональны в .env.local",
    next: "Далее",
    back: "Назад",
    finish: "Запустить POS",
    installing: "Настройка…",
    installed: "Restaurant POS готов",
    openPanel: "Открыть панель",
    restart: "Сбросить",
    ready: "подключено",
    missing: "локальный режим",
    restaurant: "Ресторан",
    cafe: "Кафе"
  },
  pt: {
    brand: "Restaurant POS",
    appTitle: "Configurar Restaurant POS",
    appSubtitle: "Configure o estabelecimento, acesso admin e fornecedor de dados.",
    stepLanguage: "Idioma",
    stepBusiness: "Negócio",
    stepCredentials: "Credenciais",
    stepProvider: "Fornecedor",
    language: "Escolha o idioma da interface",
    businessType: "Tipo de negócio",
    restaurantName: "Nome do estabelecimento",
    adminUser: "Utilizador admin",
    password: "Palavra-passe",
    passwordHint: "Pelo menos 6 caracteres",
    provider: "Fornecedor de dados",
    providerReady: "Pronto a usar",
    providerMissing: "Chaves cloud opcionais no .env.local",
    next: "Continuar",
    back: "Voltar",
    finish: "Abrir POS",
    installing: "A configurar…",
    installed: "Restaurant POS está pronto",
    openPanel: "Abrir painel",
    restart: "Reiniciar",
    ready: "ligado",
    missing: "modo local",
    restaurant: "Restaurante",
    cafe: "Café"
  }
};

export function isStepValid(step: number, form: InstallState): boolean {
  switch (step) {
    case 0:
      return true;
    case 1:
      return form.businessType === "restaurant" || form.businessType === "cafe";
    case 2:
      return (
        form.restaurantName.trim().length >= 2 &&
        form.username.trim().length >= 3 &&
        form.password.length >= PASSWORD_MIN_LENGTH
      );
    case 3:
      return form.provider === "local" || form.provider === "supabase" || form.provider === "firebase";
    default:
      return true;
  }
}

export function canFinish(form: InstallState): boolean {
  return [0, 1, 2, 3].every((step) => isStepValid(step, form));
}

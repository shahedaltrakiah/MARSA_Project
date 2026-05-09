export type AdminLocale = "en" | "ar"

export type AdminMsg = {
  title: string
  navDashboard: string
  navEntrepreneurs: string
  /** Directory of registered product users (not “workspace” wording in admin) */
  navMemberDirectory: string
  navStaff: string
  sectionOverview: string
  sectionUsers: string
  sectionSite: string
  dashboardSubtitle: string
  statRegisteredEntrepreneurs: string
  statStaff: string
  statProfilesWithContent: string
  chartCommunityOverview: string
  chartProfileMix: string
  chartBarEntrepreneurs: string
  chartBarStaff: string
  chartBarProfiles: string
  chartPieMinimal: string
  chartEmpty: string
  recentEntrepreneurs: string
  seeAllEntrepreneurs: string
  completionLabel: string
  registeredLabel: string
  viewDetails: string
  entrepreneursIntro: string
  siteBranding: string
  siteHero: string
  siteFeatures: string
  sitePricing: string
  /** Footer link — account settings for the signed-in admin */
  adminProfile: string
  logOut: string
  themeAria: string
  localeEn: string
  localeAr: string
  permBranding: string
  permHero: string
  permFeatures: string
  permPricing: string
  siteAccessHint: string
  /** Explains that staff are promoted accounts, not created inside admin */
  staffPageHint: string
  createStaffBtn: string
  createStaffTitle: string
  createStaffHint: string
  fieldName: string
  fieldEmail: string
  fieldPassword: string
  fieldRole: string
  createStaffSubmit: string
  createStaffSuccess: string
  /** /admin/profile — site staff account (not product workspace) */
  profilePageTitle: string
  profilePageSubtitle: string
  profileIdentityCard: string
  profilePasswordCard: string
  labelDisplayName: string
  labelEmailReadonly: string
  labelRole: string
  labelCurrentPassword: string
  labelNewPassword: string
  labelConfirmNewPassword: string
  btnSaveDisplayName: string
  btnChangePassword: string
  successNameSaved: string
  successPasswordChanged: string
  errNameShort: string
  errPasswordShort: string
  errPasswordMismatch: string
  saving: string
  errGeneric: string
  cancel: string
  edit: string
}

export const adminMessages: Record<AdminLocale, AdminMsg> = {
  en: {
    title: "MARSA Admin",
    navDashboard: "Dashboard",
    navEntrepreneurs: "Entrepreneur profiles",
    navMemberDirectory: "Member directory",
    navStaff: "Staff & roles",
    sectionOverview: "Overview",
    sectionUsers: "Members",
    sectionSite: "Site",
    dashboardSubtitle:
      "Overview of registrations and startup profiles. Open a member for their full profile and projects.",
    statRegisteredEntrepreneurs: "Registered entrepreneurs",
    statStaff: "Staff accounts",
    statProfilesWithContent: "Detailed profiles",
    chartCommunityOverview: "Community overview",
    chartProfileMix: "Profile engagement",
    chartBarEntrepreneurs: "Entrepreneurs",
    chartBarStaff: "Staff",
    chartBarProfiles: "Detailed",
    chartPieMinimal: "Minimal / empty",
    chartEmpty: "No entrepreneur accounts yet.",
    recentEntrepreneurs: "Recent registrations",
    seeAllEntrepreneurs: "See all entrepreneur profiles",
    completionLabel: "Profile",
    registeredLabel: "Registered",
    viewDetails: "Open",
    entrepreneursIntro:
      "Everyone listed here registered on MARSA. Startup profile fields come from onboarding and profile settings.",
    siteBranding: "Branding",
    siteHero: "Hero",
    siteFeatures: "Features",
    sitePricing: "Pricing",
    adminProfile: "Admin profile",
    logOut: "Log out",
    themeAria: "Toggle theme",
    localeEn: "English",
    localeAr: "العربية",
    permBranding: "Branding (logo & colors)",
    permHero: "Hero section",
    permFeatures: "Features section",
    permPricing: "Pricing section",
    siteAccessHint: "Choose which site pages this staff member can edit.",
    staffPageHint:
      "Staff are not created here. Someone registers on the public site (same users list). A super admin opens their profile and sets the role to admin or super admin.",
    createStaffBtn: "Create staff account",
    createStaffTitle: "New staff account",
    createStaffHint: "Creates a login for a staff member. They can sign in at /admin/login.",
    fieldName: "Full name",
    fieldEmail: "Email address",
    fieldPassword: "Password",
    fieldRole: "Role",
    createStaffSubmit: "Create account",
    createStaffSuccess: "Account created successfully.",
    profilePageTitle: "Admin account",
    profilePageSubtitle:
      "This login is for managing the public marketing site and member directory — not for building projects in the product workspace.",
    profileIdentityCard: "Display name & email",
    profilePasswordCard: "Change password",
    labelDisplayName: "Display name",
    labelEmailReadonly: "Email",
    labelRole: "Role",
    labelCurrentPassword: "Current password",
    labelNewPassword: "New password",
    labelConfirmNewPassword: "Confirm new password",
    btnSaveDisplayName: "Save name",
    btnChangePassword: "Update password",
    successNameSaved: "Name updated.",
    successPasswordChanged: "Password updated.",
    errNameShort: "Name must be at least 2 characters.",
    errPasswordShort: "Password must be at least 8 characters.",
    errPasswordMismatch: "New passwords do not match.",
    saving: "Saving…",
    errGeneric: "Something went wrong.",
    cancel: "Cancel",
    edit: "Edit",
  },
  ar: {
    title: "إدارة مارسا",
    navDashboard: "لوحة التحكم",
    navEntrepreneurs: "ملفات رواد الأعمال",
    navMemberDirectory: "دليل الأعضاء",
    navStaff: "الطاقم والصلاحيات",
    sectionOverview: "نظرة عامة",
    sectionUsers: "الأعضاء",
    sectionSite: "الموقع",
    dashboardSubtitle:
      "ملخص التسجيلات وملفات الشركات الناشئة. افتح عضوًا لعرض ملفه الكامل ومشاريعه.",
    statRegisteredEntrepreneurs: "رواد مسجّلون",
    statStaff: "حسابات الطاقم",
    statProfilesWithContent: "ملفات مفصّلة",
    chartCommunityOverview: "نظرة على المجتمع",
    chartProfileMix: "تفاعل الملفات",
    chartBarEntrepreneurs: "رواد",
    chartBarStaff: "طاقم",
    chartBarProfiles: "مفصّل",
    chartPieMinimal: "فارغ / بسيط",
    chartEmpty: "لا توجد حسابات رواد بعد.",
    recentEntrepreneurs: "آخر التسجيلات",
    seeAllEntrepreneurs: "كل ملفات رواد الأعمال",
    completionLabel: "الملف",
    registeredLabel: "تاريخ التسجيل",
    viewDetails: "فتح",
    entrepreneursIntro:
      "كل من هنا سجّل كعضو في المنصة. تُعبأ حقول ملف الشركة الناشئة من الإعداد أو إعدادات الملف الشخصي.",
    siteBranding: "الهوية",
    siteHero: "البطل",
    siteFeatures: "المزايا",
    sitePricing: "الأسعار",
    adminProfile: "ملف المشرف",
    logOut: "تسجيل الخروج",
    themeAria: "تبديل السمة",
    localeEn: "English",
    localeAr: "العربية",
    permBranding: "الهوية (الشعار والألوان)",
    permHero: "قسم البطل",
    permFeatures: "قسم المزايا",
    permPricing: "قسم الأسعار",
    siteAccessHint: "حدد أقسام الموقع التي يمكن لهذا المشرف تعديلها.",
    staffPageHint:
      "لا يُنشَأ الطاقم من هنا. يُنشَأ الحساب عبر التسجيل في الموقع العام (قائمة المستخدمين نفسها). يفتح المشرف الأعلى ملف الشخص ويغيّر الدور إلى admin أو super admin.",
    createStaffBtn: "إنشاء حساب موظف",
    createStaffTitle: "حساب موظف جديد",
    createStaffHint: "ينشئ بيانات دخول لعضو الطاقم. يمكنهم تسجيل الدخول عبر /admin/login.",
    fieldName: "الاسم الكامل",
    fieldEmail: "البريد الإلكتروني",
    fieldPassword: "كلمة المرور",
    fieldRole: "الدور",
    createStaffSubmit: "إنشاء الحساب",
    createStaffSuccess: "تم إنشاء الحساب بنجاح.",
    profilePageTitle: "حساب المشرف",
    profilePageSubtitle:
      "هذا الدخول لإدارة الموقع العام ودليل الأعضاء — وليس لبناء المشاريع في مساحة المنتج.",
    profileIdentityCard: "الاسم المعروض والبريد",
    profilePasswordCard: "تغيير كلمة المرور",
    labelDisplayName: "الاسم المعروض",
    labelEmailReadonly: "البريد الإلكتروني",
    labelRole: "الدور",
    labelCurrentPassword: "كلمة المرور الحالية",
    labelNewPassword: "كلمة المرور الجديدة",
    labelConfirmNewPassword: "تأكيد كلمة المرور",
    btnSaveDisplayName: "حفظ الاسم",
    btnChangePassword: "تحديث كلمة المرور",
    successNameSaved: "تم تحديث الاسم.",
    successPasswordChanged: "تم تحديث كلمة المرور.",
    errNameShort: "الاسم يجب أن يكون حرفين على الأقل.",
    errPasswordShort: "كلمة المرور 8 أحرف على الأقل.",
    errPasswordMismatch: "كلمتا المرور غير متطابقتين.",
    saving: "جاري الحفظ…",
    errGeneric: "حدث خطأ.",
    cancel: "إلغاء",
    edit: "تعديل",
  },
}

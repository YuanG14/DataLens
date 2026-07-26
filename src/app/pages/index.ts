export * from './LoginPage';
export * from './SignupPage';
export * from './ForgotPasswordPage';
export * from './ResetPasswordPage';
export * from './DatasetsPage';
// ImportPage and DatasetDetailPage are intentionally NOT re-exported here —
// they're loaded via React.lazy() directly in app/App.tsx (chart.js +
// the analytics engine are the heaviest part of the bundle, see Phase 10
// bundle audit). Re-exporting them from this barrel would pull them back
// into the eager bundle and silence Vite's own
// [INEFFECTIVE_DYNAMIC_IMPORT] warning without actually fixing anything.

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Save, Loader2, LogOut, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile } from '@/services/supabase/profiles';
import { supabase } from '@/services/supabase/client';
import { SUBJECTS, GRADE_LEVELS, TEACHING_STYLES, LANGUAGES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSetup = searchParams.get('setup') === 'true';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [subjects, setSubjects] = useState<string[]>(profile?.subjects || []);
  const [gradeLevels, setGradeLevels] = useState<string[]>(profile?.grade_levels || []);
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'English');
  const [teachingStyle, setTeachingStyle] = useState(profile?.teaching_style || 'Balanced');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setSubjects(profile.subjects || []);
      setGradeLevels(profile.grade_levels || []);
      setPreferredLanguage(profile.preferred_language || 'English');
      setTeachingStyle(profile.teaching_style || 'Balanced');
    }
  }, [profile]);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setIsSaving(true);

    try {
      const updated = await updateProfile(user.id, {
        full_name: fullName.trim(),
        subjects,
        grade_levels: gradeLevels,
        preferred_language: preferredLanguage,
        teaching_style: teachingStyle,
      });

      if (updated) {
        setProfile(updated);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        if (isSetup) {
          navigate('/app', { replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-container max-w-2xl">
      <PageHeader
        title={isSetup ? 'Set up your profile' : 'Profile'}
        description={isSetup ? 'Tell us about yourself so we can personalize your experience' : 'Manage your teaching preferences'}
        icon={User}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Profile saved successfully
          </div>
        )}

        {/* Name */}
        <div className="card p-5">
          <label htmlFor="profile-name" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
          />
        </div>

        {/* Subjects */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Subjects</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Select the subjects you teach</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => toggleItem(subjects, subject, setSubjects)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  subjects.includes(subject)
                    ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-300)] text-[var(--color-primary-700)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Levels */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Grade Levels</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Select the grades you teach</p>
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map((grade) => (
              <button
                key={grade}
                onClick={() => toggleItem(gradeLevels, grade, setGradeLevels)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  gradeLevels.includes(grade)
                    ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-300)] text-[var(--color-primary-700)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="card p-5">
          <label htmlFor="profile-language" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
            Preferred Language
          </label>
          <select
            id="profile-language"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Teaching Style */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Teaching Style</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">How do you prefer to teach?</p>
          <div className="flex flex-wrap gap-2">
            {TEACHING_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setTeachingStyle(style)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  teachingStyle === style
                    ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-300)] text-[var(--color-primary-700)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-danger-600)] hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isSetup ? 'Continue' : 'Save changes'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

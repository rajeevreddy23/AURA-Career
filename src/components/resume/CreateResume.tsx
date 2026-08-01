'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Download,
  Eye,
  Edit3,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Wrench,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Brain,
  TrendingUp,
  Target,
  Building2,
  ExternalLink,
  CalendarDays,
  Star,
  ArrowUp,
  X,
} from 'lucide-react';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string;
  certifications: Certification[];
}

const defaultResumeData: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: '',
  certifications: [],
};

type TemplateType = 'modern' | 'classic';

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export const CreateResume: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelligence, setIntelligence] = useState<{
    skills: string[];
    experienceLevel: string;
    suggestedRoles: string[];
    summary: string;
    strengths: string[];
    improvements: string[];
    score: number;
  } | null>(null);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [jobs, setJobs] = useState<Array<{
    title: string;
    company: string;
    location: string;
    source: string;
    description: string;
    url: string;
    postedDate: string;
  }>>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback((field: keyof ResumeData, value: any) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { id: generateId(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }, []);

  const updateEducation = useCallback((id: string, field: keyof Education, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), company: '', position: '', startDate: '', endDate: '', description: '' }],
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }, []);

  const updateExperience = useCallback((id: string, field: keyof Experience, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, []);

  const addProject = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: generateId(), name: '', description: '', technologies: '', url: '' }],
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResumeData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }, []);

  const updateProject = useCallback((id: string, field: keyof Project, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { id: generateId(), name: '', issuer: '', date: '', url: '' }],
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setResumeData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  }, []);

  const updateCertification = useCallback((id: string, field: keyof Certification, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  }, []);

  const handleImproveWithAI = useCallback(async (section: string, content: string) => {
    setIsImproving(section);
    try {
      const res = await fetch('/api/resume-hub/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content, mode: 'improve' }),
      });
      const data = await res.json();
      if (data.success && data.data.improved) {
        if (section === 'summary') {
          updateField('summary', data.data.improved);
        }
      }
    } catch {
      // silent
    } finally {
      setIsImproving(null);
    }
  }, [updateField]);

  const handleGenerateFromScratch = useCallback(async () => {
    setIsGenerating(true);
    try {
      const sections = ['summary', 'experience', 'education', 'projects', 'skills'];
      const background = resumeData.summary || 'A professional looking to create a resume';

      for (const section of sections) {
        const existingContent = resumeData[section as keyof ResumeData];
        const contentStr = typeof existingContent === 'string' ? existingContent : '';
        if (contentStr) continue;

        const res = await fetch('/api/resume-hub/improve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section,
            content: background,
            mode: 'generate',
            background,
          }),
        });
        const data = await res.json();
        if (data.success && data.data.improved) {
          if (section === 'skills') {
            updateField('skills', data.data.improved);
          } else if (section === 'summary') {
            updateField('summary', data.data.improved);
          }
        }
      }
    } catch {
      // silent
    } finally {
      setIsGenerating(false);
    }
  }, [resumeData, updateField]);

  const handleAnalyzeIntelligence = useCallback(async () => {
    setIsAnalyzing(true);
    setIntelligence(null);
    try {
      const text = [
        resumeData.summary,
        ...resumeData.experience.map(e => `${e.position} at ${e.company}: ${e.description}`),
        ...resumeData.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`),
        ...resumeData.projects.map(p => `${p.name}: ${p.description} (${p.technologies})`),
        resumeData.skills,
        ...resumeData.certifications.map(c => `${c.name} - ${c.issuer}`),
      ].filter(Boolean).join('\n');

      if (!text.trim()) return;

      const res = await fetch('/api/resume-hub/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.success && data.data.analysis) {
        const analysis = data.data.analysis;
        const skillCount = analysis.skills?.length || 0;
        const strengthCount = analysis.strengths?.length || 0;
        const improvementCount = analysis.improvements?.length || 0;
        const score = Math.min(100, Math.round(
          (skillCount * 5) + (strengthCount * 8) + (resumeData.experience.length * 10) +
          (resumeData.education.length * 8) + (resumeData.projects.length * 6) +
          (resumeData.certifications.length * 4) - (improvementCount * 3)
        ));

        setIntelligence({
          skills: analysis.skills || [],
          experienceLevel: analysis.experienceLevel || 'mid',
          suggestedRoles: analysis.suggestedRoles || [],
          summary: analysis.summary || '',
          strengths: analysis.strengths || [],
          improvements: analysis.improvements || [],
          score: Math.max(0, Math.min(100, score)),
        });
      }
    } catch {
      // silent
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeData]);

  const handleJobSearch = useCallback(async () => {
    setIsFetchingJobs(true);
    setJobs([]);
    try {
      const skills = resumeData.skills ? resumeData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const roles = resumeData.experience.map(e => e.position).filter(Boolean);

      const res = await fetch('/api/resume-hub/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: roles.length > 0 ? roles : ['Software Engineer'],
          skills: skills.length > 0 ? skills : [],
          location: resumeData.location || 'remote',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch {
      // silent
    } finally {
      setIsFetchingJobs(false);
    }
  }, [resumeData]);

  const handleDownloadPDF = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = template === 'modern' ? modernStyles : classicStyles;
    const content = generatePreviewHTML(resumeData, template);
    const html = `<!DOCTYPE html><html><head><style>${styles}</style></head><body>${content}<script>window.onload=function(){window.print();window.close()}</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  }, [resumeData, template]);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  const hasData = resumeData.fullName || resumeData.summary || resumeData.education.length > 0 || resumeData.experience.length > 0 || resumeData.projects.length > 0 || resumeData.skills || resumeData.certifications.length > 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <Button
              key={sec.id}
              variant={activeSection === sec.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(sec.id)}
            >
              <sec.icon className="h-3.5 w-3.5 mr-1.5" />
              {sec.label}
            </Button>
          ))}
        </div>

        {/* Generate from scratch */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateFromScratch}
          isLoading={isGenerating}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate from Scratch'}
        </Button>

        <AnimatePresence mode="wait">
          {activeSection === 'personal' && (
            <motion.div key="personal" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Full Name" value={resumeData.fullName} onChange={(e) => updateField('fullName', e.target.value)} leftIcon={<User className="h-4 w-4" />} placeholder="John Doe" />
                  <Input label="Email" type="email" value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} leftIcon={<Mail className="h-4 w-4" />} placeholder="john@example.com" />
                  <Input label="Phone" value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} leftIcon={<Phone className="h-4 w-4" />} placeholder="+1 (555) 123-4567" />
                  <Input label="Location" value={resumeData.location} onChange={(e) => updateField('location', e.target.value)} leftIcon={<MapPin className="h-4 w-4" />} placeholder="San Francisco, CA" />
                  <Input label="Website" value={resumeData.website} onChange={(e) => updateField('website', e.target.value)} leftIcon={<Globe className="h-4 w-4" />} placeholder="https://johndoe.com" />
                  <Input label="LinkedIn" value={resumeData.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} leftIcon={<Globe className="h-4 w-4" />} placeholder="https://linkedin.com/in/johndoe" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Professional Summary</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImproveWithAI('summary', resumeData.summary)}
                    isLoading={isImproving === 'summary'}
                    disabled={!resumeData.summary}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Improve with AI
                  </Button>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder="Write a brief professional summary highlighting your key qualifications and career goals..."
                    className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'education' && (
            <motion.div key="education" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Education</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addEducation}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.education.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No education entries added yet.</p>
                  )}
                  {resumeData.education.map((edu, i) => (
                    <div key={edu.id} className="p-4 rounded-xl border border-border space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-red-500"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Input label="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="University of California" />
                        </div>
                        <Input label="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                        <Input label="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                        <Input label="Start Date" type="date" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} />
                        <Input label="End Date" type="date" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} />
                        <Input label="GPA" value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.8" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'experience' && (
            <motion.div key="experience" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Work Experience</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.experience.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No experience entries added yet.</p>
                  )}
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl border border-border space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-red-500"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Google" />
                        <Input label="Position" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} placeholder="Software Engineer" />
                        <Input label="Start Date" type="date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                        <Input label="End Date" type="date" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          setIsImproving(`exp-${exp.id}`);
                          try {
                            const res = await fetch('/api/resume-hub/improve', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ section: `Work Experience: ${exp.position} at ${exp.company}`, content: exp.description, mode: 'improve' }),
                            });
                            const data = await res.json();
                            if (data.success && data.data.improved) {
                              updateExperience(exp.id, 'description', data.data.improved);
                            }
                          } catch {}
                          setIsImproving(null);
                        }}
                        isLoading={isImproving === `exp-${exp.id}`}
                        disabled={!exp.description}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Improve
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Projects</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addProject}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.projects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No projects added yet.</p>
                  )}
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-border space-y-3 relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500" onClick={() => removeProject(proj.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Input label="Project Name" value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="E-commerce Platform" />
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Describe the project..." className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y" />
                      </div>
                      <Input label="Technologies" value={proj.technologies} onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB" />
                      <Input label="URL" value={proj.url} onChange={(e) => updateProject(proj.id, 'url', e.target.value)} placeholder="https://github.com/..." />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Skills</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImproveWithAI('skills', resumeData.skills)}
                    isLoading={isImproving === 'skills'}
                    disabled={!resumeData.skills}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Improve
                  </Button>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={resumeData.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    placeholder="List your skills separated by commas: JavaScript, TypeScript, React, Node.js, Python, Docker..."
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  />
                  {resumeData.skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {resumeData.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                        <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'certifications' && (
            <motion.div key="certifications" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Certifications</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addCertification}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.certifications.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No certifications added yet.</p>
                  )}
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-xl border border-border space-y-3 relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500" onClick={() => removeCertification(cert.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Input label="Certification Name" value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" />
                      <Input label="Issuer" value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                      <Input label="Date Obtained" type="date" value={cert.date} onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} />
                      <Input label="Credential URL" value={cert.url} onChange={(e) => updateCertification(cert.id, 'url', e.target.value)} placeholder="https://credential.example.com" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resume Intelligence & Job Search Actions */}
        {hasData && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeIntelligence}
              isLoading={isAnalyzing}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Resume Intelligence'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleJobSearch}
              isLoading={isFetchingJobs}
              className="flex-1"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              {isFetchingJobs ? 'Searching...' : 'Search Jobs'}
            </Button>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
        {/* Preview Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Live Preview
            </Badge>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setTemplate('modern')}
                className={cn('px-2 py-1 text-xs rounded font-medium transition-colors', template === 'modern' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
              >
                Modern
              </button>
              <button
                onClick={() => setTemplate('classic')}
                className={cn('px-2 py-1 text-xs rounded font-medium transition-colors', template === 'classic' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
              >
                Classic
              </button>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleDownloadPDF} disabled={!hasData}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>

        {/* Preview Card */}
        <div className="border border-border rounded-xl bg-card shadow-lg overflow-hidden">
          <div ref={previewRef} className="resume-preview">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Fill in your details to see a live preview of your resume.
                </p>
              </div>
            ) : (
              <div className={template === 'modern' ? 'p-6' : 'p-8'}>
                {template === 'modern' ? modernTemplate(resumeData) : classicTemplate(resumeData)}
              </div>
            )}
          </div>
        </div>

        {/* Intelligence Results */}
        {intelligence && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                Resume Intelligence
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIntelligence(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Resume Score</span>
                    <span className="text-sm font-bold">{intelligence.score}/100</span>
                  </div>
                  <Progress value={intelligence.score} className="h-2" />
                </div>
                <Badge className={cn(
                  'capitalize',
                  intelligence.experienceLevel === 'entry' && 'bg-green-500/10 text-green-500',
                  intelligence.experienceLevel === 'mid' && 'bg-yellow-500/10 text-yellow-500',
                  intelligence.experienceLevel === 'senior' && 'bg-orange-500/10 text-orange-500',
                  intelligence.experienceLevel === 'lead' && 'bg-purple-500/10 text-purple-500',
                )}>
                  {intelligence.experienceLevel} Level
                </Badge>
              </div>
              {intelligence.summary && (
                <p className="text-sm text-muted-foreground">{intelligence.summary}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {intelligence.strengths.slice(0, 3).map((s) => (
                      <li key={s} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-green-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                    Improvements
                  </h4>
                  <ul className="space-y-1">
                    {intelligence.improvements.slice(0, 3).map((s) => (
                      <li key={s} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-orange-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {intelligence.suggestedRoles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Suggested Roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.suggestedRoles.map((role) => (
                      <Badge key={role} variant="outline" size="sm">{role}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Job Search Results */}
        {jobs.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" />
                Matching Jobs ({jobs.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setJobs([])}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.slice(0, 5).map((job, i) => (
                <div key={`${job.title}-${job.company}-${i}`} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant="outline" size="sm">{job.source}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {job.postedDate}
                    </span>
                  </div>
                  {job.url && job.url !== '#' && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
                    >
                      <Button size="sm" variant="outline" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

function modernTemplate(data: ResumeData) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">{data.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.website && <span>{data.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Professional Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.split(',').filter(Boolean).map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{exp.position}</h3>
                    <p className="text-xs text-muted-foreground">{exp.company}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{edu.degree} in {edu.field}</h3>
                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                {edu.gpa && <p className="text-xs text-muted-foreground mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Projects</h2>
          <div className="space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-medium text-sm">{proj.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{proj.description}</p>
                {proj.technologies && <p className="text-xs text-muted-foreground mt-1">Tech: {proj.technologies}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function classicTemplate(data: ResumeData) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center border-b-2 border-double border-gray-300 pb-4">
        <h1 className="text-2xl font-serif font-bold">{data.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-sm text-muted-foreground">
          {data.website && <span>{data.website}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Objective</h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{edu.institution}</p>
                <span className="text-xs text-muted-foreground">{edu.startDate} - {edu.endDate || 'Present'}</span>
              </div>
              <p className="text-sm">{edu.degree} in {edu.field}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{exp.position}</p>
                <span className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{exp.company}</p>
              {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <p className="text-sm">{data.skills}</p>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <p className="text-sm font-medium">{proj.name}</p>
              <p className="text-sm">{proj.description}</p>
              {proj.technologies && <p className="text-xs text-muted-foreground">Technologies: {proj.technologies}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-sm font-bold font-serif uppercase border-b border-gray-300 pb-1 mb-2">Certifications</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-1">
              <p className="text-sm font-medium">{cert.name}</p>
              <p className="text-xs text-muted-foreground">{cert.issuer} — {cert.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generatePreviewHTML(data: ResumeData, template: TemplateType): string {
  const content = template === 'modern' ? modernTemplateHTML(data) : classicTemplateHTML(data);
  return content;
}

function modernTemplateHTML(data: ResumeData): string {
  const sections: string[] = [];
  sections.push(`
    <div style="border-bottom:1px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px">
      <h1 style="font-size:22px;font-weight:700;margin:0">${data.fullName || 'Your Name'}</h1>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:13px;color:#64748b">
        ${data.email ? `<span>${data.email}</span>` : ''}
        ${data.phone ? `<span>${data.phone}</span>` : ''}
        ${data.location ? `<span>${data.location}</span>` : ''}
        ${data.website ? `<span>${data.website}</span>` : ''}
      </div>
    </div>
  `);
  if (data.summary) {
    sections.push(`<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 6px">Professional Summary</h2><p style="font-size:13px;color:#475569;line-height:1.6;margin:0">${data.summary}</p></div>`);
  }
  if (data.skills) {
    const skills = data.skills.split(',').filter(Boolean).map((s) => `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:#eef2ff;color:#6366f1;font-size:11px;font-weight:500;margin:2px">${s.trim()}</span>`).join('');
    sections.push(`<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 6px">Skills</h2><div style="display:flex;flex-wrap:wrap">${skills}</div></div>`);
  }
  if (data.experience.length > 0) {
    sections.push('<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 10px">Experience</h2>');
    for (const exp of data.experience) {
      sections.push(`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h3 style="font-size:13px;font-weight:500;margin:0">${exp.position}</h3><p style="font-size:12px;color:#64748b;margin:0">${exp.company}</p></div><span style="font-size:11px;color:#94a3b8;white-space:nowrap;margin-left:12px">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span></div>${exp.description ? `<p style="font-size:12px;color:#475569;margin:4px 0 0;line-height:1.5">${exp.description}</p>` : ''}</div>`);
    }
    sections.push('</div>');
  }
  if (data.education.length > 0) {
    sections.push('<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 10px">Education</h2>');
    for (const edu of data.education) {
      sections.push(`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h3 style="font-size:13px;font-weight:500;margin:0">${edu.degree} in ${edu.field}</h3><p style="font-size:12px;color:#64748b;margin:0">${edu.institution}</p></div><span style="font-size:11px;color:#94a3b8;white-space:nowrap;margin-left:12px">${edu.startDate || ''} - ${edu.endDate || 'Present'}</span></div>${edu.gpa ? `<p style="font-size:11px;color:#64748b;margin:2px 0 0">GPA: ${edu.gpa}</p>` : ''}</div>`);
    }
    sections.push('</div>');
  }
  if (data.projects.length > 0) {
    sections.push('<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 10px">Projects</h2>');
    for (const proj of data.projects) {
      sections.push(`<div style="margin-bottom:8px"><h3 style="font-size:13px;font-weight:500;margin:0">${proj.name}</h3><p style="font-size:12px;color:#475569;margin:2px 0 0;line-height:1.5">${proj.description}</p>${proj.technologies ? `<p style="font-size:11px;color:#64748b;margin:2px 0 0">Tech: ${proj.technologies}</p>` : ''}</div>`);
    }
    sections.push('</div>');
  }
  if (data.certifications.length > 0) {
    sections.push('<div style="margin-bottom:16px"><h2 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin:0 0 10px">Certifications</h2>');
    for (const cert of data.certifications) {
      sections.push(`<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px"><div><p style="font-size:13px;font-weight:500;margin:0">${cert.name}</p><p style="font-size:11px;color:#64748b;margin:0">${cert.issuer}</p></div><span style="font-size:11px;color:#94a3b8;white-space:nowrap;margin-left:12px">${cert.date}</span></div>`);
    }
    sections.push('</div>');
  }
  return sections.join('');
}

function classicTemplateHTML(data: ResumeData): string {
  const sections: string[] = [];
  sections.push(`
    <div style="text-align:center;border-bottom:2px double #ccc;padding-bottom:12px;margin-bottom:16px">
      <h1 style="font-size:22px;font-family:Georgia,serif;font-weight:700;margin:0">${data.fullName || 'Your Name'}</h1>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:8px;font-size:13px;color:#555">
        ${data.email ? `<span>${data.email}</span>` : ''}
        ${data.phone ? `<span>${data.phone}</span>` : ''}
        ${data.location ? `<span>${data.location}</span>` : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:4px;font-size:12px;color:#777">${data.website ? `<span>${data.website}</span>` : ''}${data.linkedin ? `<span>${data.linkedin}</span>` : ''}</div>
    </div>
  `);
  if (data.summary) {
    sections.push(`<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Objective</h2><p style="font-size:13px;line-height:1.5;margin:0">${data.summary}</p></div>`);
  }
  if (data.education.length > 0) {
    sections.push('<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Education</h2>');
    for (const edu of data.education) {
      sections.push(`<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between"><p style="font-size:13px;font-weight:500;margin:0">${edu.institution}</p><span style="font-size:11px;color:#666">${edu.startDate || ''} - ${edu.endDate || 'Present'}</span></div><p style="font-size:13px;margin:2px 0 0">${edu.degree} in ${edu.field}${edu.gpa ? ` &mdash; GPA: ${edu.gpa}` : ''}</p></div>`);
    }
    sections.push('</div>');
  }
  if (data.experience.length > 0) {
    sections.push('<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Experience</h2>');
    for (const exp of data.experience) {
      sections.push(`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between"><p style="font-size:13px;font-weight:500;margin:0">${exp.position}</p><span style="font-size:11px;color:#666">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span></div><p style="font-size:12px;color:#666;margin:0">${exp.company}</p>${exp.description ? `<p style="font-size:13px;margin:4px 0 0">${exp.description}</p>` : ''}</div>`);
    }
    sections.push('</div>');
  }
  if (data.skills) {
    sections.push(`<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Skills</h2><p style="font-size:13px;margin:0">${data.skills}</p></div>`);
  }
  if (data.projects.length > 0) {
    sections.push('<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Projects</h2>');
    for (const proj of data.projects) {
      sections.push(`<div style="margin-bottom:6px"><p style="font-size:13px;font-weight:500;margin:0">${proj.name}</p><p style="font-size:13px;margin:2px 0 0">${proj.description}</p>${proj.technologies ? `<p style="font-size:11px;color:#666;margin:2px 0 0">Technologies: ${proj.technologies}</p>` : ''}</div>`);
    }
    sections.push('</div>');
  }
  if (data.certifications.length > 0) {
    sections.push('<div style="margin-bottom:14px"><h2 style="font-size:13px;font-family:Georgia,serif;font-weight:700;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 8px">Certifications</h2>');
    for (const cert of data.certifications) {
      sections.push(`<div style="margin-bottom:4px"><p style="font-size:13px;font-weight:500;margin:0">${cert.name}</p><p style="font-size:11px;color:#666;margin:0">${cert.issuer} &mdash; ${cert.date}</p></div>`);
    }
    sections.push('</div>');
  }
  return sections.join('');
}

const modernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { body { padding: 0; } }
`;

const classicStyles = `
  body { font-family: 'Times New Roman', Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 14px; line-height: 1.4; }
  @media print { body { padding: 0; } }
`;
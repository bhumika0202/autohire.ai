import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Copy, RotateCcw, Save, Check, ChevronDown, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './CoverLetterPage.css';

const AI_LOADING_MESSAGES = [
  '✦ Reading your career profile...',
  '✦ Analyzing job requirements...',
  '✦ Tailoring your cover letter...',
  '✦ Polishing final draft...',
];

export default function CoverLetterPage() {
  const [searchParams] = useSearchParams();
  const addToast = useToast();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(searchParams.get('job') || '');
  const [generating, setGenerating] = useState(false);
  const [aiMsgIdx, setAiMsgIdx] = useState(0);
  const [coverLetter, setCoverLetter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getJobs({}).then(d => {
      setJobs(d.jobs || []);
      if (searchParams.get('job') && !selectedJob) {
        setSelectedJob(searchParams.get('job'));
      }
    }).catch(() => { });
  }, []);

  // Cycle AI messages
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => setAiMsgIdx(i => (i + 1) % AI_LOADING_MESSAGES.length), 900);
    return () => clearInterval(t);
  }, [generating]);

  const handleGenerate = async () => {
    if (!selectedJob) {
      addToast('Please select a job first', 'error');
      return;
    }
    setGenerating(true);
    setAiMsgIdx(0);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const targetJob = jobs.find(j => j.id === selectedJob);
      const data = await api.generateCoverLetter({
        job_id: selectedJob,
        job_title: targetJob?.title,
        company: targetJob?.company,
        location: targetJob?.location,
        skills: targetJob?.skills
      });
      setCoverLetter(data.coverLetter);
      setEditContent(data.coverLetter.content);
      addToast(`Cover letter generated for ${targetJob?.company || 'the job'}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to generate', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editMode ? editContent : coverLetter?.content || '');
    setCopied(true);
    addToast('Cover letter copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      await api.updateCoverLetter(coverLetter.id, { content: editContent });
      setCoverLetter({ ...coverLetter, content: editContent });
      setEditMode(false);
      addToast('Cover letter saved!', 'success');
    } catch (err) {
      addToast('Failed to save', 'error');
    }
  };

  const selectedJobData = jobs.find(j => j.id === selectedJob);
  const suggestions = coverLetter
    ? [
      `✓ Personalized for ${selectedJobData?.company || 'the company'}`,
      `✓ Highlights your relevant technical skills`,
      `✓ References your project experience`,
      `✓ Professional tone and formatting`,
      `✓ Tailored for ${selectedJobData?.title || 'the role'}`,
    ]
    : [];

  return (
    <div className="cover-letter-page">
      <div className="cl-header animate-fade-in">
        <div>
          <h1>AI Cover Letter</h1>
          <p>Create a personalized cover letter based on your profile and the job.</p>
        </div>
      </div>

      {/* Job selector + generate */}
      <div className="cl-controls card animate-fade-in">
        <div className="cl-controls-inner">
          <div className="cl-select-wrap">
            <label className="form-label">Select Job</label>
            <div className="select-with-icon">
              <FileText size={16} className="select-icon" />
              <select
                className="form-select"
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                style={{ paddingLeft: 38 }}
              >
                <option value="">Choose a job position...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-ai btn-lg cl-generate-btn"
            onClick={handleGenerate}
            disabled={generating || !selectedJob}
          >
            <Sparkles size={17} />
            {generating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* Generating state */}
      {generating && (
        <div className="cl-generating card animate-fade-in">
          <div className="cl-generating-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="cl-generating-title">AI is tailoring your cover letter...</div>
            <div className="cl-generating-msg">{AI_LOADING_MESSAGES[aiMsgIdx]}</div>
          </div>
          <div className="cl-generating-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* Result */}
      {coverLetter && !generating && (
        <div className="cl-result animate-fade-in">
          {/* Document */}
          <div className="cl-document card">
            <div className="cl-document-header">
              <div className="cl-document-title">
                <FileText size={16} />
                Cover Letter — {selectedJobData?.title || 'Job Application'}
              </div>
              <div className="cl-document-actions">
                {editMode ? (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); setEditContent(coverLetter.content); }}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>
                      <Save size={13} /> Save
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleGenerate}>
                      <RotateCcw size={13} /> Regenerate
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="cl-document-body">
              {editMode ? (
                <textarea
                  className="cl-editor"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={30}
                />
              ) : (
                <pre className="cl-content">{coverLetter.content}</pre>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="cl-suggestions">
            <div className="cl-suggestions-card card">
              <div className="cl-suggestions-header">
                <Sparkles size={15} />
                AI Quality Check
              </div>
              <div className="cl-suggestions-list">
                {suggestions.map((s, i) => (
                  <div key={i} className="cl-suggestion-item animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="cl-tips card">
              <div className="cl-tips-title">Pro Tips</div>
              <ul className="cl-tips-list">
                <li>Customize the opening to address the hiring manager by name if possible</li>
                <li>Mention specific projects that relate to their tech stack</li>
                <li>Keep it under one page for best results</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!coverLetter && !generating && (
        <div className="cl-empty animate-fade-in">
          <div className="cl-empty-icon">
            <Sparkles size={32} />
          </div>
          <h3>Ready to craft your cover letter</h3>
          <p>Select a job position above and click "Generate with AI" to create a personalized, professional cover letter tailored to the role.</p>
        </div>
      )}
    </div>
  );
}

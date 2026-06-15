import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { api } from '../lib/api';

export default function SurveyForm({ route, navigation }) {
  const { surveyId, surveyTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.questions.list(surveyId)
      .then(q => { setQuestions(q); setLoading(false); })
      .catch(() => setLoading(false));
  }, [surveyId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Thank you!</Text>
          <Text style={styles.doneSub}>Your response has been submitted successfully.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Surveys</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This survey has no questions yet.</Text>
      </View>
    );
  }

  const total = questions.length;
  const q = questions[current];
  const progress = reviewing ? 100 : ((current) / total) * 100;

  const setAnswer = (val) => setAnswers(a => ({ ...a, [q.id]: val }));

  const validate = (question = q) => {
    if (question.required === '1') {
      const val = answers[question.id];
      if (!val || (Array.isArray(val) && val.length === 0) || String(val).trim() === '') {
        Alert.alert('Required', 'Please answer this question before continuing.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (current < total - 1) setCurrent(c => c + 1);
    else setReviewing(true);
  };

  const back = () => {
    if (reviewing) setReviewing(false);
    else if (current > 0) setCurrent(c => c - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      const answerList = questions.map(q => ({
        question_id: q.id,
        answer_text: Array.isArray(answers[q.id]) ? answers[q.id].join(',') : (answers[q.id] || ''),
      }));
      formData.append('answers', JSON.stringify(answerList));
      await api.responses.submit(surveyId, formData);
      setDone(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  if (reviewing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.reviewHeader}>
          <Text style={styles.headerTitle} numberOfLines={1}>{surveyTitle}</Text>
          <Text style={styles.headerProgress}>Review your answers</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {questions.map((q, i) => (
            <View key={q.id} style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Question {i + 1}</Text>
              <Text style={styles.reviewQuestion}>{q.title}</Text>
              <View style={styles.reviewAnswerBox}>
                <Text style={answers[q.id] ? styles.reviewAnswer : styles.reviewNoAnswer}>
                  {answers[q.id]
                    ? (Array.isArray(answers[q.id]) ? answers[q.id].join(', ') : answers[q.id])
                    : 'No answer'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setReviewing(false); setCurrent(i); }}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.navButton, styles.backBtn]} onPress={back}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.submitBtn, submitting && styles.disabled]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={[styles.navButtonText, { color: '#fff' }]}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>{surveyTitle}</Text>
        <Text style={styles.headerProgress}>Question {current + 1} of {total}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionText}>
          {q.title}
          {q.required === '1' ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {q.description ? <Text style={styles.questionDesc}>{q.description}</Text> : null}

        <View style={styles.inputArea}>
          <QuestionInput q={q} value={answers[q.id]} onChange={setAnswer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backBtn, current === 0 && styles.disabled]}
          onPress={back}
          disabled={current === 0}
        >
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, styles.nextBtn]} onPress={next}>
          <Text style={[styles.navButtonText, { color: '#fff' }]}>
            {current < total - 1 ? 'Next' : 'Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function QuestionInput({ q, value, onChange }) {
  const options = q.options?.item
    ? (Array.isArray(q.options.item) ? q.options.item : [q.options.item])
    : [];

  switch (q.type) {
    case 'text':
      return (
        <TextInput
          style={styles.textInput}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Your answer"
          placeholderTextColor="#94a3b8"
        />
      );

    case 'textarea':
      return (
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Your answer"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      );

    case 'email':
      return (
        <TextInput
          style={styles.textInput}
          value={value || ''}
          onChangeText={onChange}
          placeholder="your@email.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      );

    case 'multiple_choice':
      return (
        <View>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, value === opt.value && styles.optionSelected]}
              onPress={() => onChange(opt.value)}
            >
              <View style={[styles.radio, value === opt.value && styles.radioSelected]} />
              <Text style={[styles.optionText, value === opt.value && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case 'checkbox':
      return (
        <View>
          {options.map(opt => {
            const selected = Array.isArray(value) ? value : [];
            const checked = selected.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, checked && styles.optionSelected]}
                onPress={() => {
                  const next = checked
                    ? selected.filter(v => v !== opt.value)
                    : [...selected, opt.value];
                  onChange(next);
                }}
              >
                <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.optionText, checked && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );

    case 'rating':
      return (
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.ratingBtn, value === String(n) && styles.ratingBtnSelected]}
              onPress={() => onChange(String(n))}
            >
              <Text style={[styles.ratingText, value === String(n) && styles.ratingTextSelected]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    default:
      return (
        <TextInput
          style={styles.textInput}
          value={value || ''}
          onChangeText={onChange}
          placeholder="Your answer"
          placeholderTextColor="#94a3b8"
        />
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  reviewHeader: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerProgress: { fontSize: 12, color: '#c7d2fe', marginTop: 4, marginBottom: 10 },
  progressBar: { height: 4, backgroundColor: '#6366f1', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
  content: { padding: 20, paddingBottom: 40 },
  questionText: { fontSize: 18, fontWeight: '600', color: '#1e293b', lineHeight: 26 },
  questionDesc: { fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 4 },
  required: { color: '#ef4444' },
  inputArea: { marginTop: 20 },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionSelected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12,
  },
  radioSelected: { borderColor: '#4f46e5', backgroundColor: '#4f46e5' },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxSelected: { borderColor: '#4f46e5', backgroundColor: '#4f46e5' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  optionText: { fontSize: 15, color: '#475569' },
  optionTextSelected: { color: '#4338ca', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: 12 },
  ratingBtn: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  ratingBtnSelected: { borderColor: '#4f46e5', backgroundColor: '#4f46e5' },
  ratingText: { fontSize: 18, fontWeight: '600', color: '#475569' },
  ratingTextSelected: { color: '#fff' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  backBtn: { borderWidth: 1.5, borderColor: '#e2e8f0' },
  nextBtn: { backgroundColor: '#4f46e5' },
  submitBtn: { backgroundColor: '#16a34a' },
  navButtonText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  disabled: { opacity: 0.4 },
  emptyText: { fontSize: 16, color: '#94a3b8' },
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneEmoji: { fontSize: 64, marginBottom: 16 },
  doneTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  doneSub: { fontSize: 16, color: '#64748b', marginTop: 8, textAlign: 'center' },
  backButton: {
    marginTop: 32, backgroundColor: '#4f46e5',
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  backButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewLabel: { fontSize: 11, fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  reviewQuestion: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  reviewAnswerBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 6 },
  reviewAnswer: { fontSize: 14, color: '#334155' },
  reviewNoAnswer: { fontSize: 14, color: '#94a3b8', fontStyle: 'italic' },
  editLink: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
});

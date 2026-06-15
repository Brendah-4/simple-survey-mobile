import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, StatusBar,
} from 'react-native';
import { api } from '../lib/api';

export default function AvailableSurveys({ navigation }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.surveys.list()
      .then(all => {
        setSurveys(all.filter(s => s.status === 'active'));
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading surveys...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load surveys.</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SimpleSurvey</Text>
        <Text style={styles.headerSub}>Choose a survey to get started</Text>
      </View>

      {surveys.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No surveys available right now.</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc}>{item.description}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SurveyForm', { surveyId: item.id, surveyTitle: item.title })}
              >
                <Text style={styles.buttonText}>Take Survey</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#c7d2fe', marginTop: 4 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardBody: { marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b' },
  cardDesc: { fontSize: 14, color: '#64748b', marginTop: 6 },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 15 },
  emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
  errorSub: { fontSize: 13, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
});

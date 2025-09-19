import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';

const SAMPLE_NAMES = [
  'Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Mia', 'Sophia', 'Isabella', 'Ethan', 'Lucas',
  'Amelia', 'Mason', 'James', 'Charlotte', 'Elijah', 'Harper', 'Benjamin', 'Henry', 'Evelyn', 'Jack'
];

function generateLeaderboard() {
  const shuffled = [...SAMPLE_NAMES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  const withScores = shuffled.map((name, idx) => ({
    id: `${Date.now()}-${idx}`,
    name,
    points: Math.floor(200 + Math.random() * 1800),
  }));

  withScores.sort((a, b) => b.points - a.points);
  return withScores.map((u, i) => ({ ...u, rank: i + 1 }));
}

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setPlayers(generateLeaderboard());
  }, []);

  const topThreeIds = useMemo(() => new Set(players.slice(0, 3).map(p => p.id)), [players]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate network delay
    setTimeout(() => {
      setPlayers(generateLeaderboard());
      setRefreshing(false);
    }, 400);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.row, topThreeIds.has(item.id) && styles.rowTop]}> 
      <Text style={[styles.rank, item.rank <= 3 && styles.rankTop]}>
        {item.rank}{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : ''}
      </Text>
      <View style={styles.rowCenter}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.points}>{item.points.toLocaleString()} pts</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowTop: {
    backgroundColor: '#EAF7EF',
  },
  separator: {
    height: 10,
  },
  rank: {
    width: 56,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  rankTop: {
    fontSize: 18,
  },
  rowCenter: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api, CalendarEvent } from '../services/api';

export default function CalendarScreen() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await api.getCalendarEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = ({ item }: { item: CalendarEvent }) => {
        const startTime = new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.eventCard}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{startTime}</Text>
                    <Text style={styles.timeText}>{endTime}</Text>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.eventTitle}>{item.summary}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Today's Schedule</Text>
                <TouchableOpacity onPress={loadEvents} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>↻</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : events.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No events scheduled for today.</Text>
                    <Text style={styles.emptySubtext}>Use the Planner to add some!</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderEvent}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    refreshButton: { padding: 10 },
    refreshText: { fontSize: 24, color: '#007AFF' },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    eventCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    timeContainer: { marginRight: 15, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#eee', paddingRight: 15 },
    timeText: { fontSize: 14, color: '#666', fontWeight: '600' },
    detailsContainer: { flex: 1, justifyContent: 'center' },
    eventTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
});

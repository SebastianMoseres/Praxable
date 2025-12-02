import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { api, CoreValue } from '../services/api';

export default function ValuesScreen() {
    const [values, setValues] = useState<CoreValue[]>([]);
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const data = await api.getValues();
            setValues(data);
        } catch (error) {
            console.error('Failed to load values:', error);
        }
    };

    const addValue = async () => {
        if (!newValue.trim()) return;
        try {
            await api.addValue(newValue.trim());
            setNewValue('');
            loadValues();
        } catch (error) {
            Alert.alert('Error', 'Failed to add value');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Core Values</Text>
            <Text style={styles.subtitle}>Define what matters most to you.</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a new value (e.g., Creativity)"
                    value={newValue}
                    onChangeText={setNewValue}
                />
                <TouchableOpacity style={styles.addButton} onPress={addValue}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={values}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.valueCard}>
                        <Text style={styles.valueText}>{item.value_name}</Text>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginRight: 10, fontSize: 16 },
    addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, justifyContent: 'center' },
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    list: { paddingBottom: 20 },
    valueCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    valueText: { fontSize: 18, fontWeight: '500', color: '#333' },
});

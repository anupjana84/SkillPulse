import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import {
    Text,
    FlatList,
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    RefreshControl // 1. Import RefreshControl
} from 'react-native';
import { userApi } from '../services/api';
import moment from 'moment';

const TournamentList = ({ navigation }: { navigation: any }) => {
    // 1. ALL HOOKS MUST BE AT THE TOP
    const [tournaments, setTournaments] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // This must come BEFORE any "if (loading)" or early returns
    const fetchTournaments = useCallback(async () => {
        try {
            const data = await userApi.getTournaments();
            setTournaments(data.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTournaments();
        setRefreshing(false);
    }, [fetchTournaments]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    // 2. ONLY AFTER HOOKS CAN YOU DO CONDITIONAL RETURNS
    if (!tournaments) {
        return <Text>Loading...</Text>;
    }

    const joinTournament = async (id: string) => {
        try {
            const data = await userApi.joinTournament(id);
            if (data.success) {
                navigation.navigate('TournamentDetails', { tournamentId: id });
            } else {
                Alert.alert("Failed to join the tournament");
            }
            console.log("Joined tournament successfully");

        } catch (error) {
            console.log('Error joining tournament:', error);
        }
    }

    const renderItem = ({ item }: any) => {
        const now = moment();
        const tournamentStartTime = moment(`${item.startDate} ${item.time}`, "YYYY-MM-DD HH:mm");
        const isToday = moment(item.startDate).isSame(now, 'day');

        // Important: .clone() prevents the original object from being modified
        const isBeforeDeadline = now.isBefore(tournamentStartTime.clone().subtract(1, 'minutes'));
        const showJoinButton = isToday && isBeforeDeadline;

        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.tournamentName}</Text>
                <Text style={{ color: 'white' }}>{moment(item.time, "HH:mm").format("hh:mm A")}</Text>
                <Text style={{ color: 'white' }}>
                    {moment(item.startDate).format("DD MMMM YYYY")}
                </Text>

                {showJoinButton ? (
                    <TouchableOpacity style={styles.joinButton} onPress={() => joinTournament(item._id)}>
                        <Text style={{ color: 'white' }}>Join Now</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.disabledBadge}>
                        <Text style={{ color: 'gray' }}>{isToday ? "Closed" : "Upcoming"}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={tournaments}
                keyExtractor={(item: any) => item._id}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827', // Dark background for the whole screen
    },
    card: {
        backgroundColor: '#1F2937',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 3,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8
    },
    infoText: {
        color: '#D1D5DB',
        fontSize: 14,
        marginBottom: 4
    },
    joinButton: {
        backgroundColor: '#3B82F6',
        padding: 12,
        marginTop: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: '600'
    },
    disabledBadge: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#374151',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4B5563'
    }
});

export default TournamentList;
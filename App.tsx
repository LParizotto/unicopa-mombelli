1import React, { useState, useEffect } from 'react';
2import { View, Text, FlatList } from 'react-native';
3import { supabase } from '../utils/supabase';
4
5export default function App() {
6  const [todos, setTodos] = useState([]);
7
8  useEffect(() => {
9    const getTodos = async () => {
10      try {
11        const { data: todos, error } = await supabase.from('todos').select();
12
13        if (error) {
14          console.error('Error fetching todos:', error.message);
15          return;
16        }
17
18        if (todos && todos.length > 0) {
19          setTodos(todos);
20        }
21      } catch (error) {
22        console.error('Error fetching todos:', error.message);
23      }
24    };
25
26    getTodos();
27  }, []);
28
29  return (
30    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
31      <Text>Todo List</Text>
32      <FlatList
33        data={todos}
34        keyExtractor={(item) => item.id.toString()}
35        renderItem={({ item }) => <Text key={item.id}>{item.name}</Text>}
36      />
37    </View>
38  );
39};
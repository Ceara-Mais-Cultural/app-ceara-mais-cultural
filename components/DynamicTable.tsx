import { colors } from '@/constants';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const DynamicTable = ({ data, header }: any) => {
  const [columns, setColumns] = useState<any>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setColumns(Object.keys(data[0]));
    }
  }, [data]);

  const columnWidth = 150;

  if (!data || data.length === 0) {
    return <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}><Text>Nenhum dado disponível</Text></View>;
  }

  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
        <View style={[styles.row, styles.headerCell, { width: columns.length * columnWidth }]}>
          {header.map((column: any, index: any) => (
            <Text key={index} style={[styles.headerCellText, { width: columnWidth }]}>
              {column}
            </Text>
          ))}
        </View>
        {data.map((item: any, rowIndex: any) => (
          <View key={rowIndex} style={[styles.row, { width: columns.length * columnWidth }]}>
            {columns.map((column: any, colIndex: any) => (
              <Text key={colIndex} style={[styles.cell, { width: columnWidth }]}>
                {column !== 'description' ? item[column] : item[column].slice(0, 60) + '...'}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    margin: 15,
    borderColor: colors.stroke,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#CCC',
    paddingVertical: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerCellText: {
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
  },
  cell: {
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});

export default DynamicTable;

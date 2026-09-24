import React from 'react';
import { Order } from '../../types';
import { OrdersHistoryTab } from './OrdersHistoryTab';

interface OrdersManagementTabProps {
  onViewOrderTicket: (order: Order) => void;
}

export const OrdersManagementTab: React.FC<OrdersManagementTabProps> = ({
  onViewOrderTicket,
}) => {
  return <OrdersHistoryTab onViewOrderTicket={onViewOrderTicket} />;
};


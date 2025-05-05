import { 
    Table, Column, Model, DataType, 
    ForeignKey, BelongsTo, Default
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import User from './User';
  import Prediction from './Prediction';
  
  @Table({ tableName: 'rewards' })
  export default class Reward extends Model {
    @Default(uuidv4)
    @Column({
      primaryKey: true,
      type: DataType.UUID,
    })
    id!: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    userId!: string;
  
    @BelongsTo(() => User)
    user!: User;
  
    @ForeignKey(() => Prediction)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    predictionId!: string;
  
    @BelongsTo(() => Prediction)
    prediction!: Prediction;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    points!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    description!: string;
  }
import { 
    Table, Column, Model, DataType, 
    ForeignKey, BelongsTo, Default
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import User from './User';
  import League from './League';
  
  @Table({ tableName: 'league_members' })
  export default class LeagueMember extends Model {
    @Default(uuidv4)
    @Column({
      primaryKey: true,
      type: DataType.UUID,
    })
    id!: string;
  
    @ForeignKey(() => League)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    leagueId!: string;
  
    @BelongsTo(() => League)
    league!: League;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    userId!: string;
  
    @BelongsTo(() => User)
    user!: User;
  }
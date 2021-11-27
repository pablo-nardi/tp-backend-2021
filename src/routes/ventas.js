module.exports = app =>{

    const Ventas = app.db.models.Ventas;
    const Items = app.db.models.Items;
    const Clientes = app.db.models.Clientes;
    const Productos = app.db.models.Productos;
    const {Sequelize, Op} = require("sequelize");

    app.route('/api/ventas')
        .get((req,res)=>{
            const whereCondition = {};
            if(req.query.nomTarjeta){
                Object.assign(whereCondition,{
                    nomTarjeta: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('nomTarjeta')), 'LIKE', '%'+req.query.nomTarjeta+'%')
                });
            }
            if(req.query.numTarjeta){
              Object.assign(whereCondition,{
                  numTarjeta: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('numTarjeta')), 'LIKE', '%'+req.query.numTarjeta+'%')
              });
            }
            if(req.query.dni){
              Object.assign(whereCondition,{
                dni: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('ClienteDni')), 'LIKE', '%'+req.query.dni+'%')
              });
            }
            if (req.query.activa) {
                Object.assign(whereCondition, {
                    activa: req.query.activa
                });
            }
            const order = req.query.order ? req.query.order.split(",",2) : [];
            Ventas.findAndCountAll({
                where: whereCondition,
                limit: req.query.limit,
                offset: req.query.offset * req.query.limit,
                order: [order],
                include: Clientes
            })
            .then(result => {res.json(result)})
            .catch(error =>{
                res.status(412).json({msg: error.message});
            });
        })
        .post((req,res)=>{
            req.body.activa = true;
            Ventas.create(req.body)
            .then(result => res.json(result))
            .catch(error => {
                res.status(412).json({msg: error.message});
            });
        })
        .put((req,res)=>{
            Ventas.update(req.body, {where: {ClienteDni:req.body.ClienteDni}})
            .then(result => res.sendStatus(204))
            .catch(error =>{
                res.status(412).json({msg:error.message});
            })
        })
    app.route('/api/ventas/:id')
        .get((req,res)=>{
            Ventas.findOne(
                {
                    where:  req.params,
                    include: [
                    {
                        model: Items,
                        include:{
                            model: Productos
                        }
                    },
                    {
                        model: Clientes
                    }
                    ]
                })
            .then(result=> res.json(result))
            .catch(error=>{
                res.status(412).json({msg: error.message});
            })
        })
        .delete((req,res) => {
            Ventas.destroy({where: req.params})
                .then(result=> res.sendStatus(204))
                .catch(error => {
                    res.status(412).json({msg:error.message});
                })
        })
}

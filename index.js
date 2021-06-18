/** @format */
const express = require('express');
const cors = require('cors');
const pool = require('./pgconnect');
const _3DES = require('nodejs3des');
const app = express();
const port = 3007;
const fnc = require('./assets/js/function')
const mahoa = require('./assets/js/MaHoa');
const { response } = require('express');
const fileUpload = require('express-fileupload');
// const {save } = require('save-file')
// import xlsx from 'node-xlsx'
// import fs from 'fs'
app.use(express.static('public')); //to access the files in public folder
app.use(fileUpload());

app.use(cors());
app.use(express.json());

app.use(cors());
app.listen(process.env.PORT || port, () => {
	console.log('Port : ' + port);
});

const danghoa = (e)=>{
	console.log(e.length>1)
	return e.toString().length > 1 ? e : `0${e}`
  }

//#region TaiKhoan (Quản Trị viên)
app.get('/TaiKhoanNguoiDung/:TaiKhoan/:MatKhau', async (req,res)=>{ //Đăng nhập tài khoản người dùng
	try {
		var TaiKhoan = req.params.TaiKhoan; // req.body lấy dữ liệu từ client về server
		var MatKhau = req.params.MatKhau; // req.body lấy dữ liệu từ client về server
		const newTodo = await pool.query(
			`
				select * from tbl_nguoi_dung,tbl_nhan_vien where tbl_nhan_vien.nhan_vien_id = tbl_nguoi_dung.nhan_vien_id and 
				ten_dang_nhap = N'${TaiKhoan}' and mat_khau = N'${mahoa.Encrypt_LOOP_3DES(MatKhau,TaiKhoan,1)}'
			`
		);
		// res.send('<h3>a</h3>')
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.get('/LayTenNhanVien', async (req,res)=>{ //Lấy tên nhân viên
	try {
		const newTodo = await pool.query(
			`
				select * from tbl_nhan_vien
			`
		);
		// res.send('<h3>a</h3>')
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.post('/ThemTenNhanVien',async (req,res)=>{ 
	try {
		const DuLieuNV = await pool.query(`select * from tbl_nhan_vien`)

		const DuLieuNhanVien = req.body;
		const newTodo = await pool.query(
			`
			insert into tbl_nhan_vien(ma_nhan_vien,ten_nhan_vien,dia_chi,dien_thoai,ghi_chu,ngay_tao,nguoi_tao)
			values(N'${fnc.MaNV(DuLieuNV.rows)}',N'${DuLieuNhanVien.ten_nhan_vien}',N'${DuLieuNhanVien.dia_chi}',N'${DuLieuNhanVien.dien_thoai}',N'${DuLieuNhanVien.ghi_chu}','${DuLieuNhanVien.ngay_tao}',N'${DuLieuNhanVien.nguoi_tao}')
			`
		);
		const DuLieuTruyenLen = await pool.query(`select nhan_vien_id,ten_nhan_vien from tbl_nhan_vien where ma_nhan_vien = N'${fnc.MaNV(DuLieuNV.rows)}'`)
		// console.log(DuLieuTruyenLen.rows)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		
	}
})
app.post('/ThemTaiKhoan', async (req,res)=>{
	try {
		const {nhan_vien_id,ten_dang_nhap,mat_khau,mat_khau_lai,quyen,ghi_chu,nguoi_tao,ngay_tao} = req.body;
		const newTodo = await pool.query(
		`
			insert into tbl_nguoi_dung(nhan_vien_id,ten_dang_nhap,mat_khau,quyen,ghi_chu,ngay_tao,nguoi_tao)
			values(${nhan_vien_id},N'${ten_dang_nhap}',N'${mahoa.Encrypt_LOOP_3DES(mat_khau,ten_dang_nhap,1)}',N'${quyen}',N'${ghi_chu}','${ngay_tao}',N'${nguoi_tao}')
		`)
		const DuLieuTruyenLen = await pool.query(
			`
			select tbl_nguoi_dung.*,tbl_nhan_vien.ten_nhan_vien from tbl_nguoi_dung,tbl_nhan_vien where 
			tbl_nguoi_dung.ten_dang_nhap = N'${ten_dang_nhap}' and tbl_nguoi_dung.nhan_vien_id = tbl_nhan_vien.nhan_vien_id
			`
		);
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.get('/HienThiTaiKhoan', async(req,res)=>{
	try {
		const newTodo = await pool.query(`
			select tbl_nguoi_dung.ghi_chu,tbl_nguoi_dung.nguoi_dung_id,tbl_nguoi_dung.ten_dang_nhap,tbl_nguoi_dung.quyen,tbl_nhan_vien.ten_nhan_vien,tbl_nguoi_dung.nguoi_tao,tbl_nguoi_dung.ngay_tao from tbl_nhan_vien,tbl_nguoi_dung where tbl_nhan_vien.nhan_vien_id = tbl_nguoi_dung.nhan_vien_id
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.put('/SuaTaiKhoan', async (req,res)=>{
	try {
		const {nguoi_dung_id,ten_dang_nhap,mat_khau,ghi_chu,quyen,nguoi_sua,ngay_sua}=req.body
		const newTodo = await pool.query(`
			update tbl_nguoi_dung set nguoi_sua=N'${nguoi_sua}',ngay_sua='${ngay_sua}',ten_dang_nhap = N'${ten_dang_nhap}',
			mat_khau=N'${mahoa.Encrypt_LOOP_3DES(mat_khau,ten_dang_nhap,1)}',quyen=N'${quyen}',ghi_chu=N'${ghi_chu}'
			where nguoi_dung_id = ${nguoi_dung_id}
		`)

		console.log(newTodo)
		const DuLieuTruyenLen = await pool.query(
			`
			select tbl_nguoi_dung.*,tbl_nhan_vien.ten_nhan_vien from tbl_nguoi_dung,tbl_nhan_vien where 
			tbl_nguoi_dung.ten_dang_nhap = N'${ten_dang_nhap}' and tbl_nguoi_dung.nhan_vien_id = tbl_nhan_vien.nhan_vien_id
			`
		);
		console.log(DuLieuTruyenLen.rows)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		
	}
})
app.delete('/XoaTaiKhoan', async (req,res)=>{
	try {
		const {nguoi_dung_id}=req.body
		const newTodo = await pool.query(`
			DELETE from tbl_nguoi_dung WHERE nguoi_dung_id = ${nguoi_dung_id}
		`)
		// console.log(newTodo)
		console.log(newTodo)
	} catch (error) {
		console.log(error)
	}
})
//#endregion

//#region  Phân quyền người dùng
app.get('/PhanQuyenNguoiDung', async (req,res)=>{
	try {
		const newTodo= await pool.query(`
			select nguoi_dung_id,ten_dang_nhap,quyen,danh_sach_quyen from tbl_nguoi_dung
		`)
		res.json(newTodo.rows)

	} catch (error) {
		
	}
})

app.put('/PhanQuyenNguoiDung',async (req,res)=>{
	try {
		const {nguoi_dung_id,quyen,PQ} = req.body
		const newTodo = await pool.query(`
			update tbl_nguoi_dung set quyen = N'${quyen}',danh_sach_quyen=N'${PQ}'
			where nguoi_dung_id = ${nguoi_dung_id}
		`)
		console.log({nguoi_dung_id,quyen,PQ})
		res.json(newTodo)
	} catch (error) {
		
	}
})
//#endregion

//#region DanhMuc
	//#region LoaiDoiTuong
app.get('/LoaiDoiTuong', async (req,res)=>{
	try {
		const newTodo = await pool.query(`
			select * from tbl_loai_doi_tuong
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.post('/LoaiDoiTuong', async (req,res)=>{
	try {
		const ldt = await pool.query(`select * from tbl_loai_doi_tuong`)
		const {ten_loai_doi_tuong,tien_bao_cong_no,ghi_chu,nguoi_tao,ngay_tao} = req.body
		const newTodo = await pool.query(`
			insert into tbl_loai_doi_tuong(
				ma_loai_doi_tuong,ten_loai_doi_tuong,tien_bao_cong_no,ghi_chu,nguoi_tao,ngay_tao
			)
			values(
				N'${fnc.MaLDT(ldt.rows)}',N'${ten_loai_doi_tuong}',${tien_bao_cong_no},N'${ghi_chu}',N'${nguoi_tao}','${ngay_tao}'
			)
		`)
		
		const DuLieuTruyenLen = await pool.query(`
			select * from tbl_loai_doi_tuong where ma_loai_doi_tuong = N'${fnc.MaLDT(ldt.rows)}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		
	}
})

app.put('/LoaiDoiTuong', async (req,res)=>{
	try {
		const {ma_loai_doi_tuong,ten_loai_doi_tuong,tien_bao_cong_no,ghi_chu,nguoi_sua,ngay_sua} = req.body
		const newTodo = await pool.query(`
			update tbl_loai_doi_tuong set ten_loai_doi_tuong = N'${ten_loai_doi_tuong}',tien_bao_cong_no=${tien_bao_cong_no},ghi_chu=N'${ghi_chu}',nguoi_sua='${nguoi_sua}',ngay_sua='${ngay_sua}'
			where ma_loai_doi_tuong =N'${ma_loai_doi_tuong}'
		`)
		
		const DuLieuTruyenLen = await pool.query(`
			select * from tbl_loai_doi_tuong where ma_loai_doi_tuong = N'${ma_loai_doi_tuong}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		
	}
})
app.delete('/LoaiDoiTuong', async (req,res)=>{
	try {
		const {ma_loai_doi_tuong} = req.body
		const newTodo = await pool.query(`
			delete from tbl_loai_doi_tuong where ma_loai_doi_tuong = N'${ma_loai_doi_tuong}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion

	//#region Đối tượng
app.get('/DoiTuong/:Kieu',async(req,res)=>{
	try {
		const Kieu = req.params.Kieu
		if(Kieu==='0' || Kieu ==='1')
		{
			const newTodo = await pool.query(`
			select tbl_doi_tuong.*,tbl_loai_doi_tuong.ten_loai_doi_tuong,
			CASE
			   WHEN tbl_doi_tuong.kieu = 0 THEN 'Khách hàng'
			   WHEN tbl_doi_tuong.kieu = 1 THEN 'NCC'
			   WHEN tbl_doi_tuong.kieu = 2 THEN 'Khách hàng & NCC'
			END kieu_text,
			CASE
			   WHEN tbl_doi_tuong.vip = 0 THEN 'Thường'
			   WHEN tbl_doi_tuong.vip = 1 THEN 'VIP'
			END vip_text
			,tbl_doi_tuong.no_mua-tbl_doi_tuong.no_ban"tong_no" from tbl_loai_doi_tuong,tbl_doi_tuong
			where tbl_loai_doi_tuong.loai_doi_tuong_id = tbl_doi_tuong.loai_doi_tuong_id and (kieu = ${Kieu} or kieu=2)
			`)
			res.json(newTodo.rows)
		}
		else{
			const newTodo = await pool.query(`
			select tbl_doi_tuong.*,tbl_loai_doi_tuong.ten_loai_doi_tuong,
			CASE
			   WHEN tbl_doi_tuong.kieu = 0 THEN 'Khách hàng'
			   WHEN tbl_doi_tuong.kieu = 1 THEN 'NCC'
			   WHEN tbl_doi_tuong.kieu = 2 THEN 'Khách hàng & NCC'
			END kieu_text,
			CASE
			   WHEN tbl_doi_tuong.vip = 0 THEN 'Thường'
			   WHEN tbl_doi_tuong.vip = 1 THEN 'VIP'
			END vip_text
			,tbl_doi_tuong.no_mua-tbl_doi_tuong.no_ban"tong_no" from tbl_loai_doi_tuong,tbl_doi_tuong
			where tbl_loai_doi_tuong.loai_doi_tuong_id = tbl_doi_tuong.loai_doi_tuong_id
			`)
			res.json(newTodo.rows)
		}
	} catch (error) {
		
	}
})

app.post('/DoiTuong/:Kieu',async(req,res)=>{
	try {
		const Kieu = req.params.Kieu
		const {loai_doi_tuong_id,ten_doi_tuong,
			dia_chi,dien_thoai,ma_so_thue,no_mua_dau_ky,no_ban_dau_ky,
			kieu,ghi_chu,ngay_tao,nguoi_tao,ngay_sinh,
			ngay_bao_cong_no,chiet_khau,vip,no_ban} = req.body
		const dl = await pool.query(`select * from tbl_doi_tuong`)
		if(Kieu==='0')
		{
			const newTodo = await pool.query(`
			insert into tbl_doi_tuong 
			(loai_doi_tuong_id,ma_doi_tuong,ten_doi_tuong,
			dia_chi,dien_thoai,ma_so_thue,no_mua_dau_ky,no_mua,
			kieu,ghi_chu,ngay_tao,nguoi_tao,ngay_sinh,
			ngay_bao_cong_no,chiet_khau,vip)
			values(${loai_doi_tuong_id},N'${fnc.MaDT(dl.rows)}',N'${ten_doi_tuong}',
			N'${dia_chi}','${dien_thoai}',N'${ma_so_thue}',${no_mua_dau_ky},${no_mua_dau_ky},${kieu},N'${ghi_chu}',
			'${ngay_tao}','${nguoi_tao}','${ngay_sinh}',${ngay_bao_cong_no},${chiet_khau},${vip})
			`)
		}else if (Kieu==='1'){
			const newTodo = await pool.query(`
			insert into tbl_doi_tuong 
			(loai_doi_tuong_id,ma_doi_tuong,ten_doi_tuong,
			dia_chi,dien_thoai,ma_so_thue,no_ban_dau_ky,no_ban,
			kieu,ghi_chu,ngay_tao,nguoi_tao,ngay_sinh,
			ngay_bao_cong_no,chiet_khau,vip)
			values(${loai_doi_tuong_id},N'${fnc.MaDT(dl.rows)}',N'${ten_doi_tuong}',
			N'${dia_chi}','${dien_thoai}',N'${ma_so_thue}',${no_ban_dau_ky},${no_ban_dau_ky},${kieu},N'${ghi_chu}',
			'${ngay_tao}','${nguoi_tao}','${ngay_sinh}',${ngay_bao_cong_no},${chiet_khau},${vip})
			`)
		}else{
			const newTodo = await pool.query(`
			insert into tbl_doi_tuong 
			(loai_doi_tuong_id,ma_doi_tuong,ten_doi_tuong,
			dia_chi,dien_thoai,ma_so_thue,no_mua_dau_ky,no_mua,
			kieu,ghi_chu,ngay_tao,nguoi_tao,ngay_sinh,
			ngay_bao_cong_no,chiet_khau,vip,no_ban_dau_ky,no_ban)
			values(${loai_doi_tuong_id},N'${fnc.MaDT(dl.rows)}',N'${ten_doi_tuong}',
			N'${dia_chi}','${dien_thoai}',N'${ma_so_thue}',${no_mua_dau_ky},${no_mua_dau_ky},${kieu},N'${ghi_chu}',
			'${ngay_tao}','${nguoi_tao}','${ngay_sinh}',${ngay_bao_cong_no},${chiet_khau},${vip},${no_ban_dau_ky},${no_ban_dau_ky})
			`)
		}
		const DuLieuTruyenLen = await pool.query(`
		select tbl_doi_tuong.*,tbl_loai_doi_tuong.ten_loai_doi_tuong,
		CASE
		   WHEN tbl_doi_tuong.kieu = 0 THEN 'Khách hàng'
		   WHEN tbl_doi_tuong.kieu = 1 THEN 'NCC'
		   WHEN tbl_doi_tuong.kieu = 2 THEN 'Khách hàng & NCC'
		END kieu_text,
		CASE
		   WHEN tbl_doi_tuong.vip = 0 THEN 'Thường'
		   WHEN tbl_doi_tuong.vip = 1 THEN 'VIP'
		END vip_text
		,tbl_doi_tuong.no_mua-tbl_doi_tuong.no_ban"tong_no" from tbl_loai_doi_tuong,tbl_doi_tuong
		where tbl_loai_doi_tuong.loai_doi_tuong_id = tbl_doi_tuong.loai_doi_tuong_id and tbl_doi_tuong.ten_doi_tuong =N'${ten_doi_tuong}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.put('/DoiTuong/:Kieu' , async (req,res)=>{
	try {
		const Kieu = req.params.Kieu
		const {ten_doi_tuong,ma_doi_tuong,
			dia_chi,dien_thoai,ma_so_thue,no_mua_dau_ky,no_ban_dau_ky,
			kieu,ghi_chu,nguoi_sua,ngay_sua,ngay_sinh,
			ngay_bao_cong_no,chiet_khau,vip,no_ban,no_mua} = req.body
		// console.log()
		const dl = await pool.query(`select no_mua_dau_ky,no_mua,no_ban_dau_ky,no_ban from tbl_doi_tuong where  ma_doi_tuong =N'${ma_doi_tuong}'`)
		// console.log(kieu)
		var no_mua_moi = parseFloat(dl.rows[0].no_mua) + ( parseFloat(no_mua_dau_ky)- parseFloat(dl.rows[0].no_mua_dau_ky) ) 
		var no_ban_moi = parseFloat(dl.rows[0].no_ban) + ( parseFloat(no_ban_dau_ky)- parseFloat(dl.rows[0].no_ban_dau_ky) ) 
		// console.log('No mua : ' + no_mua_moi)
		// console.log('No ban : ' + no_ban_moi)
		if(kieu==='0')
		{
			const newTodo = await pool.query(`
			update tbl_doi_tuong 
			set ten_doi_tuong = N'${ten_doi_tuong}',
			dia_chi=N'${dia_chi}',dien_thoai = '${dien_thoai}',ma_so_thue=N'${ma_so_thue}',no_mua_dau_ky=${no_mua_dau_ky},no_mua=${no_mua_moi.toString()},
			kieu=${kieu},ghi_chu=N'${ghi_chu}',nguoi_sua='${nguoi_sua}',ngay_sua='${ngay_sua}',ngay_sinh='${ngay_sinh}',
			ngay_bao_cong_no=${ngay_bao_cong_no},chiet_khau=${chiet_khau},vip=${vip}
			where ma_doi_tuong = N'${ma_doi_tuong}'
			
			`)
		}else if (kieu==='1'){
			const newTodo = await pool.query(`
			update tbl_doi_tuong 
			set ten_doi_tuong = N'${ten_doi_tuong}',
			dia_chi=N'${dia_chi}',dien_thoai = '${dien_thoai}',ma_so_thue=N'${ma_so_thue}',no_ban_dau_ky=${no_ban_dau_ky},no_ban=${no_ban_moi.toString()},
			kieu=${kieu},ghi_chu=N'${ghi_chu}',nguoi_sua='${nguoi_sua}',ngay_sua='${ngay_sua}',ngay_sinh='${ngay_sinh}',
			ngay_bao_cong_no=${ngay_bao_cong_no},chiet_khau=${chiet_khau},vip=${vip}
			where ma_doi_tuong = N'${ma_doi_tuong}'
			`)
		}else{
			const newTodo = await pool.query(`
			update tbl_doi_tuong 
			set ten_doi_tuong = N'${ten_doi_tuong}',
			dia_chi=N'${dia_chi}',dien_thoai = '${dien_thoai}',ma_so_thue=N'${ma_so_thue}',no_mua_dau_ky=${no_mua_dau_ky},no_mua=${no_mua_moi.toString()},
			kieu=${kieu},ghi_chu=N'${ghi_chu}',nguoi_sua='${nguoi_sua}',ngay_sua='${ngay_sua}',ngay_sinh='${ngay_sinh}',
			ngay_bao_cong_no=${ngay_bao_cong_no},chiet_khau=${chiet_khau},vip=${vip},no_ban_dau_ky=${no_ban_dau_ky},no_ban=${no_ban_moi.toString()}
			where ma_doi_tuong = N'${ma_doi_tuong}'
			`)
		}
		const DuLieuTruyenLen = await pool.query(`
		select tbl_doi_tuong.*,tbl_loai_doi_tuong.ten_loai_doi_tuong,
		CASE
		   WHEN tbl_doi_tuong.kieu = 0 THEN 'Khách hàng'
		   WHEN tbl_doi_tuong.kieu = 1 THEN 'NCC'
		   WHEN tbl_doi_tuong.kieu = 2 THEN 'Khách hàng & NCC'
		END kieu_text,
		CASE
		   WHEN tbl_doi_tuong.vip = 0 THEN 'Thường'
		   WHEN tbl_doi_tuong.vip = 1 THEN 'VIP'
		END vip_text
		,tbl_doi_tuong.no_mua-tbl_doi_tuong.no_ban"tong_no" from tbl_loai_doi_tuong,tbl_doi_tuong
		where tbl_loai_doi_tuong.loai_doi_tuong_id = tbl_doi_tuong.loai_doi_tuong_id and tbl_doi_tuong.ten_doi_tuong =N'${ten_doi_tuong}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.delete('/DoiTuong' ,async(req,res)=>{
	try {
		const {ma_doi_tuong} = req.body
		const newTodo = await pool.query(`
			delete from tbl_doi_tuong where ma_doi_tuong =N'${ma_doi_tuong}' 
		`)
		res.json(newTodo.rows)
	} catch (error) {
		res.json({
			status:0
		})
		console.log(error)
	}
})
	//#endregion
	//#region DonViTinh
app.get('/DonViTinh', async (req,res)=>{
	try {
		const newTodo = await pool.query(`select * from tbl_dvt`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})
app.post('/DonViTinh', async (req,res)=>{
	try {
		const {ten_dvt,ghi_chu,nguoi_tao,ngay_tao} = req.body
		const dl = await pool.query(`select * from tbl_dvt`)
		const newTodo = await pool.query(`
		insert into tbl_dvt(ma_dvt,ten_dvt,ghi_chu,ngay_tao,nguoi_tao)
		values (N'${fnc.MaDVT(dl.rows)}',N'${ten_dvt}',N'${ghi_chu}','${ngay_tao}','${nguoi_tao}')
		`)
		const DuLieuTruyenLen = await pool.query(`
		select * from tbl_dvt where ma_dvt = N'${fnc.MaDVT(dl.rows)}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.put('/DonViTinh', async (req,res)=>{
	try {
		const {ma_dvt,ten_dvt,ghi_chu,nguoi_sua,ngay_sua} = req.body
		const newTodo = await pool.query(`
		update tbl_dvt set ten_dvt=N'${ten_dvt}',ghi_chu=N'${ghi_chu}',ngay_sua='${ngay_sua}',
		nguoi_sua=N'${nguoi_sua}' where ma_dvt = N'${ma_dvt}'
		`)
		console.log(newTodo)
		const DuLieuTruyenLen = await pool.query(`
		select * from tbl_dvt where ma_dvt = N'${ma_dvt}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.delete('/DonViTinh', async (req,res)=>{
	try {
		const {ma_dvt} = req.body
		
		const newTodo = await pool.query(`
				delete from tbl_dvt where ma_dvt = N'${ma_dvt}'
		`)
		console.log(newTodo)
		res.json(newTodo.rows)
	} catch (error) {
		res.json({
			status:0,
			message:''
		})
		console.log(error)
	}
})
	//#endregion
	//#region LoaiHang
app.get('/LoaiHang/:TrangThai', async (req,res)=>{
	try {
		const TrangThai = req.params.TrangThai
		const newTodo = await pool.query(`
		select tbl_loai_hang.*,tbl_nganh_hang.ten_nganh_hang from tbl_loai_hang,tbl_nganh_hang
		where tbl_loai_hang.nganh_hang_id = tbl_nganh_hang.nganh_hang_id and tbl_loai_hang.trang_thai=${TrangThai}
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.post('/LoaiHang', async (req,res)=>{
	try {
		const {nganh_hang_id,ten_loai_hang,ghi_chu,nguoi_tao,ngay_tao,trang_thai,url} = req.body
		const dl = await pool.query(`select * from tbl_loai_hang`)
		const newTodo = await pool.query(`
		insert into tbl_loai_hang(ma_loai_hang,ten_loai_hang,ghi_chu,ngay_tao,nguoi_tao,trang_thai,kieu,nganh_hang_id,link_danh_muc)
		values(N'${fnc.MaLH(dl.rows)}',N'${ten_loai_hang}',N'${ghi_chu}','${ngay_tao}','${nguoi_tao}',${trang_thai},0,${nganh_hang_id},N'${url}')
		`)
		const DuLieuTruyenLen = await pool.query(`		
		select tbl_loai_hang.*,tbl_nganh_hang.ten_nganh_hang from tbl_loai_hang,tbl_nganh_hang
		where tbl_loai_hang.nganh_hang_id = tbl_nganh_hang.nganh_hang_id and tbl_loai_hang.trang_thai=${trang_thai}
		and tbl_loai_hang.ma_loai_hang = N'${fnc.MaLH(dl.rows)}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.get(`/LoaiHangTheoMaLoaiHang/:MaLoaiHang` , async (req,res)=>{
	try {
		const MaLoaiHang = req.params.MaLoaiHang
		const newTodo = await pool.query(`
			select ten_loai_hang from tbl_loai_hang where ma_loai_hang = N'${MaLoaiHang}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.put('/LoaiHang', async (req,res)=>{
	try {
		const {nganh_hang_id,ma_loai_hang,ghi_chu,ten_loai_hang,nguoi_sua,ngay_sua,trang_thai,url,sua_url} = req.body
		console.log(url)
		if(sua_url){
			const newTodo = await pool.query(`
			update tbl_loai_hang set link_danh_muc = N'${url}'
			where ma_loai_hang = N'${ma_loai_hang}'
			`)

		}else{
			const newTodo = await pool.query(`
			update tbl_loai_hang set ten_loai_hang =N'${ten_loai_hang}',ghi_chu=N'${ghi_chu}',
			nguoi_sua='${nguoi_sua}',ngay_sua='${ngay_sua}',trang_thai=${trang_thai},nganh_hang_id=${nganh_hang_id}
			where ma_loai_hang = N'${ma_loai_hang}'
			`)
		}
		const DuLieuTruyenLen = await pool.query(`		
		select tbl_loai_hang.*,tbl_nganh_hang.ten_nganh_hang from tbl_loai_hang,tbl_nganh_hang
		where tbl_loai_hang.nganh_hang_id = tbl_nganh_hang.nganh_hang_id and tbl_loai_hang.trang_thai=${trang_thai}
		and tbl_loai_hang.ma_loai_hang = N'${ma_loai_hang}'
		`)
		res.json(DuLieuTruyenLen.rows)
		
	} catch (error) {
		console.log(error)
	}
})

app.delete('/LoaiHang' , async (req,res)=>{
	try {
		const {ma_loai_hang} = req.body
		const newTodo = await pool.query(`
			delete from tbl_loai_hang where ma_loai_hang = N'${ma_loai_hang}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion

	//#region NganhHang
app.get('/NganhHang', async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_nganh_hang
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.post('/NganhHang' , async (req,res)=>{
	try {
		const {ten_nganh_hang,ghi_chu,nguoi_tao,trang_thai,ngay_tao} = req.body
		const dl = await pool.query(`select * from tbl_nganh_hang`)
		const newTodo = await pool.query(`
			insert into tbl_nganh_hang(ma_nganh_hang,ten_nganh_hang,ghi_chu,ngay_tao,nguoi_tao,trang_thai)
			values(N'${fnc.MaNH(dl.rows)}',N'${ten_nganh_hang}',N'${ghi_chu}','${ngay_tao}','${nguoi_tao}',${trang_thai})
		`)
		const DuLieuTruyenLen = await pool.query(`
			select * from tbl_nganh_hang where ma_nganh_hang = N'${fnc.MaNH(dl.rows)}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.put('/NganhHang' , async (req,res)=>{
	try {
		const {ma_nganh_hang,ten_nganh_hang,ghi_chu,nguoi_sua,trang_thai,ngay_sua} = req.body
		console.log({ma_nganh_hang,ten_nganh_hang,ghi_chu,nguoi_sua,trang_thai,ngay_sua})
		const newTodo = await pool.query(`
			update tbl_nganh_hang set ten_nganh_hang=N'${ten_nganh_hang}',ghi_chu=N'${ghi_chu}',ngay_sua='${ngay_sua}',nguoi_sua='${nguoi_sua}',trang_thai=${trang_thai}
			where ma_nganh_hang = N'${ma_nganh_hang}'
		`)
		const DuLieuTruyenLen = await pool.query(`
			select * from tbl_nganh_hang where ma_nganh_hang = N'${ma_nganh_hang}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.delete('/NganhHang' , async (req,res)=>{
	try {
		const {ma_nganh_hang} = req.body
		const newTodo = await pool.query(`
				delete from tbl_nganh_hang where ma_nganh_hang = N'${ma_nganh_hang}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})
app.get('/NganhHangPhanLoaiSuDung/:TrangThai', async (req,res)=>{
	try {
		const TrangThai = req.params.TrangThai
		const newTodo = await pool.query(`
		select * from tbl_nganh_hang where trang_thai = ${TrangThai}
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion

	//#region MatHang
app.get('/LoaiHangTheoNganhHang/:nganh_hang_id' ,async(req,res)=>{
	try {
		const nganh_hang_id = req.params.nganh_hang_id
		const newTodo = await pool.query(`
			select * from tbl_loai_hang where nganh_hang_id = ${nganh_hang_id} and trang_thai = true
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.get('/MatHang/:TrangThai' , async(req,res)=>{
	try {
		const TrangThai = req.params.TrangThai
		const newTodo = await pool.query(`
		select tbl_hang.ghi_chu"ghi_chu_hang",*,tbl_hang_ton_dau_ky.so_luong_dau_ky+tbl_hang_ton_dau_ky.so_luong_phat_sinh"SoLuongTon" from tbl_dvt,tbl_hang,tbl_nganh_hang,tbl_loai_hang,tbl_hang_ton_dau_ky
		where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
		and tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang_ton_dau_ky.trang_thai = ${TrangThai}
		and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get('/MatHang/TheoKhoHang/:TrangThai/:TenKho' , async(req,res)=>{
	try {
		const {TrangThai,TenKho} = req.params.TrangThai
		const newTodo = await pool.query(`
		select tbl_hang.ghi_chu"ghi_chu_hang",*,
		tbl_hang_ton_dau_ky.so_luong_dau_ky+tbl_hang_ton_dau_ky.so_luong_phat_sinh"SoLuongTon" from tbl_dvt,tbl_hang,
		tbl_nganh_hang,tbl_loai_hang,tbl_hang_ton_dau_ky,tbl_kho
		where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
		and tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang_ton_dau_ky.trang_thai = ${TrangThai}
		and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
		and tbl_hang_ton_dau_ky.kho_id = tbl_kho.kho_id
		and tbl_tbl_hang_ton_dau_ky.kho_id = (
			select kho_id from tbl_kho where  ten_kho = N'${TenKho}'
		)
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})

app.put(`/SuaMatHang`  , async (req,res) =>{
	try {
		
		console.log('test')
		const { dl,TrangThaiSua,url } = req.body

		console.log({ dl,TrangThaiSua,url })
		if(TrangThaiSua){
			const newTodo = await pool.query(`
				update tbl_hang_ton_dau_ky 
				set duong_link = N'${url}'
				where hang_id = ${dl.hang_id}
			`)
			res.json(newTodo.rows)
		}else{
			const newTodo = await pool.query(`

			`)
		}
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.get('/MatHang/:TrangThai/:IDLoaiHang' , async(req,res)=>{
	try {
		
		const TrangThai = req.params.TrangThai
		const IDLoaiHang = req.params.IDLoaiHang
		// console.log(IDLoaiHang)
		const newTodo = await pool.query(`
		select tbl_hang.ghi_chu"ghi_chu_hang",*,tbl_hang_ton_dau_ky.so_luong_dau_ky+tbl_hang_ton_dau_ky.so_luong_phat_sinh"SoLuongTon" from tbl_dvt,tbl_hang,tbl_nganh_hang,tbl_loai_hang,tbl_hang_ton_dau_ky
		where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
		and tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang_ton_dau_ky.trang_thai = ${TrangThai}
		and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
		and tbl_loai_hang.loai_hang_id = ${IDLoaiHang}
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})
app.get('/MatHang/:TrangThai/:IDLoaiHang/:TenHang' , async(req,res)=>{
	try {
		
		const TrangThai = req.params.TrangThai
		const TenHang = req.params.TenHang
		// console.log(IDLoaiHang)
		const newTodo = await pool.query(`
		select tbl_hang.ghi_chu"ghi_chu_hang",*,tbl_hang_ton_dau_ky.so_luong_dau_ky+tbl_hang_ton_dau_ky.so_luong_phat_sinh"SoLuongTon" from tbl_dvt,tbl_hang,tbl_nganh_hang,tbl_loai_hang,tbl_hang_ton_dau_ky
		where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
		and tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang_ton_dau_ky.trang_thai = ${TrangThai}
		and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
		and convertTVkdau(LOWER(tbl_hang.ten_hang)) like  convertTVkdau(LOWER(N'%${TenHang}%'))
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})
app.post('/MatHang',async (req,res)=>{
	try {
		const {ten_hang,loai_hang_id,nguoi_tao,ngay_tao,dvt_id,so_luong_dau_ky,so_luong_phat_sinh,gia_goc,gia_thuc_nhap,gia_ban_buon,gia_ban_le,ten_biet_duoc,hoat_chat,nha_san_xuat
		,ghi_chu,so_luong_toi_thieu,trang_thai,hsd_toi_thieu,hsd_muc_xanh,hsd_muc_vang,hsd_muc_do,url,hanh2,
		hanh3,
		hanh4} = req.body
		const dl = await pool.query(`
			select * from tbl_hang
		`)
		// console.log({ten_hang,loai_hang_id,nguoi_tao,ngay_tao,dvt_id,so_luong_dau_ky,so_luong_phat_sinh,gia_goc,gia_thuc_nhap,gia_ban_buon,gia_ban_le,ten_biet_duoc,hoat_chat,nha_san_xuat
		// 	,ghi_chu,so_luong_toi_thieu,trang_thai,hsd_toi_thieu,hsd_muc_xanh,hsd_muc_vang,hsd_muc_do})
		const newTodo = await pool.query(`
			insert into tbl_hang(
				loai_hang_id,ma_hang,ten_hang,ghi_chu,ngay_tao,nguoi_tao
			)
			values (${loai_hang_id},N'${fnc.MaHang(dl.rows)}',N'${ten_hang}',N'${ghi_chu}','${ngay_tao}',N'${nguoi_tao}');

			insert into tbl_hang_ton_dau_ky
			(hang_id,nguoi_tao,ngay_tao,kho_id,doi_tuong_id,dvt_id,so_luong_dau_ky,
			gia_goc,gia_thuc_nhap,gia_ban_buon,gia_ban_le,ten_biet_duoc,hoat_chat,nha_san_xuat,
			ghi_chu,so_luong_toi_thieu,trang_thai,tong_tien,hsd_toi_thieu,hsd_muc_xanh,hsd_muc_vang,hsd_muc_do,duong_link)
			values((select hang_id from tbl_hang where ten_hang = N'${ten_hang}' LIMIT 1),N'${nguoi_tao}','${ngay_tao}',1,2,${dvt_id},${so_luong_dau_ky},
			${gia_goc},${gia_thuc_nhap},${gia_ban_buon},${gia_ban_le},N'${ten_biet_duoc}',N'${hoat_chat}',N'${nha_san_xuat}',
			N'${ghi_chu}',${so_luong_toi_thieu},${trang_thai},${gia_thuc_nhap},${hsd_toi_thieu},${hsd_muc_xanh},${hsd_muc_vang},${hsd_muc_do},N'${url}')
		`)
		const DuLieuTruyenLen = await pool.query(`
		select tbl_hang.ghi_chu"ghi_chu_hang",*,tbl_hang_ton_dau_ky.so_luong_dau_ky+tbl_hang_ton_dau_ky.so_luong_phat_sinh"SoLuongTon" from tbl_dvt,tbl_hang,tbl_nganh_hang,tbl_loai_hang,tbl_hang_ton_dau_ky
		where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
		and tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang_ton_dau_ky.trang_thai = ${trang_thai}
		and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id and tbl_hang.ma_hang = N'${fnc.MaHang(dl.rows)}}'
		`)
		console.log('them thanh cong')
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}	
})
app.put('/MatHang',async(req,res)=>{
	try {
		const {ma_hang,ten_hang,gia_ban_le,ghi_chu,ngay_sua,nguoi_sua} = req.body

		console.log({ma_hang,ten_hang,gia_ban_le,ghi_chu,ngay_sua,nguoi_sua})
		const newTodo = await pool.query(`
			update tbl_hang 
			set ghi_chu = N'${ghi_chu}',ten_hang = N'${ten_hang}',ngay_sua='${ngay_sua}',nguoi_sua='${nguoi_sua}'
			where ma_hang = N'${ma_hang}';
			update tbl_hang_ton_dau_ky 
			set ghi_chu = N'${ghi_chu}',gia_ban_le = ${gia_ban_le},ngay_sua='${ngay_sua}',nguoi_sua='${nguoi_sua}'
			where hang_id = (
				select hang_id from tbl_hang where ma_hang = N'${ma_hang}'
			);
		`)

		const DuLieuTruyenLen = await pool.query(`
			select * from tbl_hang,tbl_hang_ton_dau_ky
			where tbl_hang.hang_id = tbl_hang_ton_dau_ky.hang_id
			and tbl_hang_ton_dau_ky.hang_id = 
			(select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
	}
})
app.delete('/MatHang',async(req,res)=>{
	try {
		const {ma_hang} = req.body
		const newTodo = await pool.query(`
		delete from tbl_hang_ton_dau_ky where hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}');
		delete from tbl_hang where hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion

	//#endregion
	
//#endregion

//#region QuanLyBanHang
	//#region QuanLyBanHangMayPOS
	// app.get('/PhieuNhap/:Kieu/:hoa_don_ban_id' , async (req,res)=>{
	// 	try {
	// 		const Kieu = req.params.Kieu
	// 		const hoa_don_ban_id = req.params.hoa_don_ban_id
	// 		console.log({hoa_don_ban_id,Kieu})
	// 		// console.log(hoa_don_ban_id)
	// 		// and date_part('day', ngay) = 31
	// 		// and date_part('month', ngay) = 1
	// 		// and date_part('year',ngay) = 2021
	// 		const newTodo = await pool.query(`
	// 			select tbl_hang.ma_hang,tbl_hang.ten_hang,tbl_phieu_nhap_chi_tiet.so_luong,tbl_phieu_nhap_chi_tiet.don_gia from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet ,tbl_hang
	// 			where kieu = ${Kieu} and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
	// 			and tbl_hang.hang_id = tbl_phieu_nhap_chi_tiet.hang_id and tbl_phieu_nhap.phieu_nhap_id = N'${hoa_don_ban_id}'
	// 		`)
	// 		res.json(newTodo.rows)
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// })

	app.get('/HoaDonBan/:Kieu' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			console.log(Kieu)
			const newTodo = await pool.query(`
			select TO_CHAR(tbl_hoa_don_ban.ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_hoa_don_ban
			`)
			res.json(newTodo.rows)
		} catch (error) {
			console.log(error)
		}
	})
	app.get('/HoaDonBan/:Kieu/:hoa_don_ban_id/:NgayBatDau/:NgayKetThuc' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			const NgayBatDau = req.params.NgayBatDau
			const NgayKetThuc = req.params.NgayKetThuc
			console.log(Kieu)
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			const newTodo = await pool.query(`
			select TO_CHAR(tbl_hoa_don_ban.ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_hoa_don_ban
			where (tbl_hoa_don_ban.ngay >= '${NgayBatDau}' and tbl_hoa_don_ban.ngay <= '${NgayKetThuc}'  ) 
			`)
			res.json(newTodo.rows)
			// console.log(newTodo.rows)
		} catch (error) {
			console.log(error)
		}
	})
	app.get('/HoaDonBan/:Kieu/:hoa_don_ban_id' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			const hoa_don_ban_id = req.params.hoa_don_ban_id
			// console.log(hoa_don_ban_id)
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			const newTodo = await pool.query(`
				select tbl_hang.ma_hang,tbl_hang.ten_hang,tbl_hoa_don_ban_chi_tiet.so_luong,tbl_hoa_don_ban_chi_tiet.don_gia from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet ,tbl_hang
				where kieu = ${Kieu} and tbl_hoa_don_ban.hoa_don_ban_id = tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
				and tbl_hang.hang_id = tbl_hoa_don_ban_chi_tiet.hang_id and tbl_hoa_don_ban.hoa_don_ban_id = N'${hoa_don_ban_id}'
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})
	
	app.post('/HoaDonBan', async (req,res)=>{
		try {
			const {GioHang,ngay_tao,nguoi_tao,tong_tien,nhan_vien_id} = req.body
			var ngay_viet_nam = (ngay_tao.split(' ')[0].split('-')[2].length > 1 ? ngay_tao.split(' ')[0].split('-')[2] : "0"+ngay_tao.split(' ')[0].split('-')[2]) + '-' + (ngay_tao.split(' ')[0].split('-')[1].length > 1 ? ngay_tao.split(' ')[0].split('-')[1] : '0'+ngay_tao.split(' ')[0].split('-')[1]) + '-' + ngay_tao.split(' ')[0].split('-')[0]
			console.log(ngay_viet_nam)
			const dl = await pool.query(`
			select * from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet where 
			date_part('day', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[0]} 
			and date_part('month', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[1]} 
			and date_part('year', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[2]}
			and tbl_hoa_don_ban_chi_tiet.trang_thai_so_seri = N'HD'
			and tbl_hoa_don_ban.hoa_don_ban_id = tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
			`)
			// console.log(dl.rows)
			// Tạo hoá đơn
			const hoa_don_ban_id = fnc.HoaDonBanID(dl.rows,ngay_viet_nam)
			const TaoHoaDon = await pool.query(`
			insert into tbl_hoa_don_ban(hoa_don_ban_id,ngay,doi_tuong_id,ten_doi_tuong,tong_gia_tri,tien_thuc_tra,trang_thai,kieu,nhan_vien_id,nguoi_tao)
			values (N'${hoa_don_ban_id}','${ngay_tao}',1,N'Khách lẻ',${tong_tien},${tong_tien},true,1,${nhan_vien_id},N'${nguoi_tao}')
			`)
			
			// 
			// Cập nhập tồn kho
			GioHang.map(async(x)=>{
				const newTodo = await pool.query(`
				update tbl_hang_ton_dau_ky set so_luong_phat_sinh = so_luong_phat_sinh - ${x.so_luong} where hang_id = ${x.hang_id} ;
				insert into tbl_hoa_don_ban_chi_tiet(hoa_don_ban_id,kho_id,doi_tuong_id,hang_id,dvt_id,so_luong,don_gia,trang_thai_so_seri)
				values(N'${hoa_don_ban_id}',1,2,${x.hang_id} ,(select dvt_id from tbl_hang_ton_dau_ky where hang_id = ${x.hang_id}) ,${x.so_luong}, ${x.gia_ban_le}, N'HD')
			`)
			})
			res.json(hoa_don_ban_id)
		} catch (error) {
			console.log(error)
		}
	})
		//#endregion
		//#region QuanLyTraHangKH
	
	app.post(`/HoaDonTraHangKH` , async(req,res)=>{
		try {
			const {GioHang,ngay_tao,nguoi_tao,tong_tien,nhan_vien_id} = req.body
			var ngay_viet_nam = (ngay_tao.split(' ')[0].split('-')[2].length > 1 ? ngay_tao.split(' ')[0].split('-')[2] : "0"+ngay_tao.split(' ')[0].split('-')[2]) + '-' + (ngay_tao.split(' ')[0].split('-')[1].length > 1 ? ngay_tao.split(' ')[0].split('-')[1] : '0'+ngay_tao.split(' ')[0].split('-')[1]) + '-' + ngay_tao.split(' ')[0].split('-')[0]
			console.log(ngay_viet_nam)
			const dl = await pool.query(`
			select * from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet where 
			date_part('day', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[0]} 
			and date_part('month', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[1]} 
			and date_part('year', tbl_hoa_don_ban.ngay) = ${ngay_viet_nam.split('-')[2]}
			and tbl_hoa_don_ban_chi_tiet.trang_thai_so_seri != N'HD'
			and tbl_hoa_don_ban.hoa_don_ban_id = tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
			`)
			// console.log(dl.rows)
			// Tạo hoá đơn
			const hoa_don_ban_id = fnc.KhachHangTraID(dl.rows,ngay_viet_nam)
			console.log(hoa_don_ban_id)
			const TaoHoaDon = await pool.query(`
			insert into tbl_hoa_don_ban(hoa_don_ban_id,ngay,doi_tuong_id,ten_doi_tuong,tong_gia_tri,tien_thuc_tra,trang_thai,kieu,nhan_vien_id,nguoi_tao)
			values (N'${hoa_don_ban_id}','${ngay_tao}',1,N'Khách lẻ',-${tong_tien},-${tong_tien},true,0,${nhan_vien_id},N'${nguoi_tao}')
			`)
			
			// 
			// Cập nhập tồn kho
			GioHang.map(async(x)=>{
				const newTodo = await pool.query(`
				update tbl_hang_ton_dau_ky set so_luong_phat_sinh = so_luong_phat_sinh + ${x.so_luong} where hang_id = ${x.hang_id} ;
				insert into tbl_hoa_don_ban_chi_tiet(hoa_don_ban_id,kho_id,doi_tuong_id,hang_id,dvt_id,so_luong,don_gia,trang_thai_so_seri)
				values(N'${hoa_don_ban_id}',1,2,${x.hang_id} ,(select dvt_id from tbl_hang_ton_dau_ky where hang_id = ${x.hang_id}) ,-${x.so_luong}, ${x.gia_ban_le}, N'Ktra')
			`)
			})
			res.json(hoa_don_ban_id)
		} catch (error) {
			console.log(error)
		}
	})
	//#endregion
//#endregion


//#region Nhập xuất
	//#region Nhập hàng














	// ************************************************
	app.get('/PhieuNhap/:Kieu' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			const newTodo = await pool.query(`
			select TO_CHAR(tbl_phieu_nhap.ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_phieu_nhap where kieu = ${Kieu}
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})
	app.get('/PhieuNhap/:Kieu/:phieu_nhap_id/:NgayBatDau/:NgayKetThuc' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			const NgayBatDau = req.params.NgayBatDau
			const NgayKetThuc = req.params.NgayKetThuc
			console.log(Kieu)
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			const newTodo = await pool.query(`
			select TO_CHAR(tbl_phieu_nhap.ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_phieu_nhap where kieu = ${Kieu}
			and (tbl_phieu_nhap.ngay >= '${NgayBatDau}' and tbl_phieu_nhap.ngay <= '${NgayKetThuc}'  ) 
			`)
			res.json(newTodo.rows)
			// console.log(newTodo.rows)
		} catch (error) {
			console.log(error)
		}
	})
	app.get('/PhieuNhap/:Kieu/:phieu_nhap_id' , async (req,res)=>{
		try {
			const Kieu = req.params.Kieu
			const phieu_nhap_id = req.params.phieu_nhap_id
			// console.log(hoa_don_ban_id)
			// and date_part('day', ngay) = 31
			// and date_part('month', ngay) = 1
			// and date_part('year',ngay) = 2021
			console.log(`
			select tbl_hang.ma_hang,tbl_hang.ten_hang,tbl_phieu_nhap_chi_tiet.so_luong,tbl_phieu_nhap_chi_tiet.don_gia from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet ,tbl_hang
			where kieu = ${Kieu} and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
			and tbl_hang.hang_id = tbl_phieu_nhap_chi_tiet.hang_id and tbl_phieu_nhap.phieu_nhap_id = N'${phieu_nhap_id}'
		`)
			const newTodo = await pool.query(`
				select tbl_hang.ma_hang,tbl_hang.ten_hang,tbl_phieu_nhap_chi_tiet.so_luong,tbl_phieu_nhap_chi_tiet.don_gia from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet ,tbl_hang
				where kieu = ${Kieu} and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
				and tbl_hang.hang_id = tbl_phieu_nhap_chi_tiet.hang_id and tbl_phieu_nhap.phieu_nhap_id = N'${phieu_nhap_id}'
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})
	
	app.post('/PhieuNhap', async (req,res)=>{
		try {
			const {GioHang,ngay_tao,nguoi_tao,tong_tien,nhan_vien_id} = req.body
			var ngay_viet_nam = (ngay_tao.split(' ')[0].split('-')[2].length > 1 ? ngay_tao.split(' ')[0].split('-')[2] : "0"+ngay_tao.split(' ')[0].split('-')[2]) + '-' + (ngay_tao.split(' ')[0].split('-')[1].length > 1 ? ngay_tao.split(' ')[0].split('-')[1] : '0'+ngay_tao.split(' ')[0].split('-')[1]) + '-' + ngay_tao.split(' ')[0].split('-')[0]
			console.log(ngay_viet_nam)
			const dl = await pool.query(`
			select * from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet where 
			date_part('day', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[0]} 
			and date_part('month', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[1]} 
			and date_part('year', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[2]}
			and tbl_phieu_nhap_chi_tiet.trang_thai_so_seri = N''
			and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
			`)
			// console.log(dl.rows)
			// Tạo hoá đơn
			const phieu_nhap_id = fnc.PhieuNhapID(dl.rows,ngay_viet_nam)
			const TaoHoaDon = await pool.query(`
			insert into tbl_phieu_nhap(phieu_nhap_id,ngay,doi_tuong_id,ten_doi_tuong,tong_gia_tri,tien_thuc_tra,trang_thai,kieu,nguoi_tao)
			values (N'${phieu_nhap_id}','${ngay_tao}',2,N'Nhà cung cấp lẻ',${tong_tien},${tong_tien},true,1,N'${nguoi_tao}')
			`)
			
			// 
			// Cập nhập tồn kho
			GioHang.map(async(x)=>{
				const newTodo = await pool.query(`
				update tbl_hang_ton_dau_ky set so_luong_phat_sinh = so_luong_phat_sinh + ${x.so_luong} where hang_id = ${x.hang_id}

				`)
				const  pnct = await pool.query(`
				insert into tbl_phieu_nhap_chi_tiet(phieu_nhap_id,kho_id,hang_id,dvt_id,so_luong,don_gia,trang_thai_so_seri)
				values(N'${phieu_nhap_id}',1,${x.hang_id} ,(select dvt_id from tbl_hang_ton_dau_ky where hang_id = ${x.hang_id}) ,${x.so_luong}, ${x.gia_thuc_nhap}, N'')
				`)
				console.log(newTodo)
				console.log(pnct)
			})
			res.json(phieu_nhap_id)
		} catch (error) {
			console.log(error)
		}
	})
		//#endregion
		//#region QuanLyTraHangKH
	
	app.post(`/HoaDonTraHangNCC` , async(req,res)=>{
		try {
			const {GioHang,ngay_tao,nguoi_tao,tong_tien,nhan_vien_id} = req.body
			var ngay_viet_nam = (ngay_tao.split(' ')[0].split('-')[2].length > 1 ? ngay_tao.split(' ')[0].split('-')[2] : "0"+ngay_tao.split(' ')[0].split('-')[2]) + '-' + (ngay_tao.split(' ')[0].split('-')[1].length > 1 ? ngay_tao.split(' ')[0].split('-')[1] : '0'+ngay_tao.split(' ')[0].split('-')[1]) + '-' + ngay_tao.split(' ')[0].split('-')[0]
			console.log(ngay_viet_nam)
			const dl = await pool.query(`
			select * from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet where 
			date_part('day', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[0]} 
			and date_part('month', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[1]} 
			and date_part('year', tbl_phieu_nhap.ngay) = ${ngay_viet_nam.split('-')[2]}
			and tbl_phieu_nhap_chi_tiet.trang_thai_so_seri = N'TraN'
			and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
			`)
			// console.log(dl.rows)
			// Tạo hoá đơn
			const phieu_nhap_id = fnc.PhieuTraNCCID(dl.rows,ngay_viet_nam)
			console.log(phieu_nhap_id)
			const TaoHoaDon = await pool.query(`
			insert into tbl_phieu_nhap(phieu_nhap_id,ngay,doi_tuong_id,ten_doi_tuong,tong_gia_tri,tien_thuc_tra,trang_thai,kieu,nguoi_tao)
			values (N'${phieu_nhap_id}','${ngay_tao}',2,N'Nhà cung cấp lẻ',-${tong_tien},-${tong_tien},true,0,N'${nguoi_tao}')
			`)
			
			// 
			// Cập nhập tồn kho
			GioHang.map(async(x)=>{
				const newTodo = await pool.query(`
				update tbl_hang_ton_dau_ky set so_luong_phat_sinh = so_luong_phat_sinh - ${x.so_luong} where hang_id = ${x.hang_id} ;
				insert into tbl_phieu_nhap_chi_tiet(phieu_nhap_id,kho_id,hang_id,dvt_id,so_luong,don_gia,trang_thai_so_seri)
				values(N'${phieu_nhap_id}',1,${x.hang_id} ,(select dvt_id from tbl_hang_ton_dau_ky where hang_id = ${x.hang_id}) ,-${x.so_luong}, ${x.gia_thuc_nhap}, N'Ktra')
			`)
			})
			res.json(phieu_nhap_id)
		} catch (error) {
			console.log(error)
		}
	})



	// ************************************************


	//#endregion



	//#region PhieuThuChi
	app.get(`/PhieuThuChi/:Kieu`, async (req,res)=>{
		try {
			/* kiểu 0 phiếu thu*/
			/* kiểu 1 phiếu chi*/
	
			/* Chi phí khác loại 2 còn đâu loại 1*/
			const Kieu = req.params.Kieu
			const newTodo = await pool.query(`
			select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})

	app.get(`/PhieuThuChi/:Kieu`, async (req,res)=>{
		try {
			/* kiểu 0 phiếu thu*/
			/* kiểu 1 phiếu chi*/
	
			/* Chi phí khác loại 2 còn đâu loại 1*/
			const Kieu = req.params.Kieu
			const newTodo = await pool.query(`
			select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})


	app.get(`/PhieuThuChi/:Kieu/:NgayBatDau/:NgayKetThuc`, async (req,res)=>{
		try {
			/* kiểu 0 phiếu thu*/
			/* kiểu 1 phiếu chi*/
	
			/* Chi phí khác loại 2 còn đâu loại 1*/
			const {NgayBatDau,NgayKetThuc} = req.params
			const Kieu = req.params.Kieu
			const newTodo = await pool.query(`
			select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}

			and (ngay >= '${NgayBatDau}' and ngay <= '${NgayKetThuc}')
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})




app.get(`/PhieuThuChi/:Kieu/:NgayTao`, async (req,res)=>{
		try {
			/* kiểu 0 phiếu thu*/
			/* kiểu 1 phiếu chi*/
	
			/* Chi phí khác loại 2 còn đâu loại 1*/
			const Kieu = req.params.Kieu
			const NgayTao = req.params.NgayTao
			console.log(NgayTao)
			const newTodo = await pool.query(`
			select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
			and date_part('day', ngay) = ${NgayTao.split('-')[2]}
			and date_part('month', ngay) = ${NgayTao.split('-')[1]}
			and date_part('year', ngay) = ${NgayTao.split('-')[0]}
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})
app.get(`/PhieuThuChi/:Kieu/:NgayTao/:NgayBatDau/:NgayKetThuc`, async (req,res)=>{
	try {
		/* kiểu 0 phiếu thu*/
		/* kiểu 1 phiếu chi*/

		/* Chi phí khác loại 2 còn đâu loại 1*/
		const Kieu = req.params.Kieu
		const NgayTao = req.params.NgayTao
		console.log(NgayTao)
		const newTodo = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
		and date_part('day', ngay) = 1
		and date_part('month', ngay) = 2
		and date_part('year', ngay) = 2021
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.post(`/PhieuThuChi/:Kieu`,async (req,res)=>{
	try {
		/* kiểu 0 phiếu thu*/
		/* kiểu 1 phiếu chi*/

		/* Chi phí khác loại 2 còn đâu loại 1*/
		const {thoi_gian,thu_chi_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,ghi_chu,ngay_tao,nguoi_tao,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,khoa_so,loai} = req.body
		const Kieu = req.params.Kieu
		var ngay_viet_nam = (ngay.split(' ')[0].split('-')[2].length > 1 ? ngay.split(' ')[0].split('-')[2] : "0"+ngay.split(' ')[0].split('-')[2]) + '-' + (ngay.split(' ')[0].split('-')[1].length > 1 ? ngay.split(' ')[0].split('-')[1] : '0'+ngay.split(' ')[0].split('-')[1]) + '-' + ngay.split(' ')[0].split('-')[0]
		// console.log(ngay_viet_nam)
		const dl = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
		and date_part('day', ngay) = ${ngay_viet_nam.split('-')[0]} 
		and date_part('month', ngay) = ${ngay_viet_nam.split('-')[1]} 
		and date_part('year', ngay) = ${ngay_viet_nam.split('-')[2]} 
		`)
		
		const newTodo = await pool.query(`
		insert into tbl_thu_chi(thu_chi_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,kieu,ghi_chu,ngay_tao,nguoi_tao,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,khoa_so,loai)
	values(N'${Kieu==='0' ? fnc.PhieuThuID(dl.rows,ngay_viet_nam) : fnc.PhieuChiID(dl.rows,ngay_viet_nam)}','${ngay+' '+ thoi_gian}',${nhan_vien_id},N'${noi_dung}',${so_tien},true,${Kieu},N'${ghi_chu}','${ngay_tao}',N'${nguoi_tao}',N'${ten_doi_tuong}',N'${dia_chi}','${dien_thoai}','${ma_so_thue}',0,${loai});
		
		`)
		const TruyenDuLieuLen = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where thu_chi_id = N'${Kieu==='0' ? fnc.PhieuThuID(dl.rows,ngay_viet_nam) : fnc.PhieuChiID(dl.rows,ngay_viet_nam)}'
		`)
		console.log(TruyenDuLieuLen.rows)
		res.json(TruyenDuLieuLen.rows)

	} catch (error) {
		console.log(error)
	}
})
app.put(`/PhieuThuChi/:Kieu` , async (req,res)=>{
	try {
		const {thoi_gian,thu_chi_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,ghi_chu,nguoi_sua,ngay_sua,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,loai} = req.body
		const Kieu = req.params.Kieu
		var so_tien_new = so_tien
		if(so_tien_new.indexOf('₫') >0){
			
			so_tien_new = 	parseInt(so_tien.split('.').join("").split('₫').join("")).toString()
		}
		console.log(so_tien_new)
		console.log({thoi_gian,thu_chi_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,ghi_chu,nguoi_sua,ngay_sua,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,loai})
		const newTodo = await pool.query(`
		update tbl_thu_chi set ngay='${ngay}',nhan_vien_id=${nhan_vien_id},noi_dung=N'${noi_dung}',so_tien=${so_tien_new},kieu=${Kieu},ghi_chu=N'${ghi_chu}',
		ngay_sua='${ngay_sua}',nguoi_tao=N'${nguoi_sua}',ten_doi_tuong=N'${ten_doi_tuong}',dia_chi=N'${dia_chi}',dien_thoai=N'${dien_thoai}',ma_so_thue=N'${ma_so_thue}'
		where thu_chi_id = '${thu_chi_id}'
		`)
		var ngay_viet_nam = (ngay_sua.split(' ')[0].split('-')[2].length > 1 ? ngay_sua.split(' ')[0].split('-')[2] : "0"+ngay_sua.split(' ')[0].split('-')[2]) + '-' + (ngay_sua.split(' ')[0].split('-')[1].length > 1 ? ngay_sua.split(' ')[0].split('-')[1] : '0'+ngay_sua.split(' ')[0].split('-')[1]) + '-' + ngay_sua.split(' ')[0].split('-')[0]
		// console.log(ngay_viet_nam)
		const TruyenDuLieuLen = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thu_chi where kieu = ${Kieu}
		and thu_chi_id = '${thu_chi_id}'
		`)
		res.json(TruyenDuLieuLen.rows)
		// console.log(TruyenDuLieuLen.rows)
	} catch (error) {
		console.log(error)
	}
})
app.delete(`/PhieuThuChi`,async (req,res)=>{
	try {
		const {thu_chi_id} = req.body
		const newTodo = await pool.query(`
		DELETE FROM tbl_thu_chi WHERE thu_chi_id = N'${thu_chi_id}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion 







	













	//#region CongNO
app.get(`/CongNo/:Kieu/:NgayTao`, async (req,res)=>{
		try {
			/* Kiểu 1 Thanh toán NCC */
			/* Kiểu 0 Thanh toánKhách hàng */

			const Kieu = req.params.Kieu
			const NgayTao = req.params.NgayTao
			console.log(NgayTao)
			const newTodo = await pool.query(`
			select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thanh_toan where kieu = ${Kieu}
			and date_part('day', ngay) = ${NgayTao.split('-')[2]}
			and date_part('month', ngay) = ${NgayTao.split('-')[1]}
			and date_part('year', ngay) = ${NgayTao.split('-')[0]}
			`)
			res.json(newTodo.rows)
		} catch (error) {
			
		}
	})
app.get(`/CongNo/:Kieu/:NgayTao/:NgayBatDau/:NgayKetThuc`, async (req,res)=>{
	try {
		/* kiểu 0 phiếu thu*/
		/* kiểu 1 phiếu chi*/

		/* Chi phí khác loại 2 còn đâu loại 1*/
		const Kieu = req.params.Kieu
		const NgayTao = req.params.NgayTao
		console.log(NgayTao)
		const newTodo = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thanh_toan where kieu = ${Kieu}
		and date_part('day', ngay) = 1
		and date_part('month', ngay) = 2
		and date_part('year', ngay) = 2021
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.post(`/CongNo/:Kieu`,async (req,res)=>{
	try {
		/* kiểu 0 phiếu thu*/
		/* kiểu 1 phiếu chi*/

		/* Chi phí khác loại 2 còn đâu loại 1*/
		const {thoi_gian,thanh_toan_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,
			ghi_chu,ngay_tao,nguoi_tao,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,khoa_so,loai} = req.body
		const Kieu = req.params.Kieu
		var ngay_viet_nam = (ngay.split(' ')[0].split('-')[2].length > 1 ? ngay.split(' ')[0].split('-')[2] : "0"+ngay.split(' ')[0].split('-')[2]) + '-' + (ngay.split(' ')[0].split('-')[1].length > 1 ? ngay.split(' ')[0].split('-')[1] : '0'+ngay.split(' ')[0].split('-')[1]) + '-' + ngay.split(' ')[0].split('-')[0]
		// console.log(ngay_viet_nam)
		const dl = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thanh_toan where kieu = ${Kieu}
		and date_part('day', ngay) = ${ngay_viet_nam.split('-')[0]} 
		and date_part('month', ngay) = ${ngay_viet_nam.split('-')[1]} 
		and date_part('year', ngay) = ${ngay_viet_nam.split('-')[2]} 
		`)
		const cong_no = await pool.query(`
			select * from tbl_doi_tuong where ten_doi_tuong = N'${ten_doi_tuong}'
		`)

		console.log( {thoi_gian,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,ghi_chu,ngay_tao,
			nguoi_tao,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,loai})
		// const update_cong_no = await pool.query(`
		// 	UPDATE tbl_doi_tuong ${
		// 		Kieu === '0' ? `set no_mua = ${parseInt(cong_no.rows.map(x=>x.no_mua))-parseInt(so_tien)}` :
		// 		`set no+ban = ${parseInt(cong_no.rows.map(x=>x.no_ban))-parseInt(so_tien)}`
		// 	}
		// 	where ten_doi_tuong = N'${ten_doi_tuong}'
		// `)
		const newTodo = await pool.query(`
		insert into tbl_thanh_toan(thanh_toan_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,kieu,ghi_chu,ngay_tao,nguoi_tao,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,khoa_so)
	values(N'${Kieu==='0' ? fnc.ThanhToanKHID(dl.rows,ngay_viet_nam) : fnc.ThanhToanNCCID(dl.rows,ngay_viet_nam)}','${ngay+' '+ thoi_gian}',${nhan_vien_id},N'${noi_dung}',${so_tien},true,${Kieu},N'${ghi_chu}','${ngay_tao}',N'${nguoi_tao}',N'${ten_doi_tuong}',N'${dia_chi}','${dien_thoai}','${ma_so_thue}',0);
		`)
		const TruyenDuLieuLen = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thanh_toan where thanh_toan_id = N'${Kieu==='0' ? fnc.ThanhToanKHID(dl.rows,ngay_viet_nam) : fnc.ThanhToanNCCID(dl.rows,ngay_viet_nam)}'
		`)
		console.log(TruyenDuLieuLen.rows)
		res.json(TruyenDuLieuLen.rows)

	} catch (error) {
		console.log(error)
	}
})
app.put(`/CongNo/:Kieu` , async (req,res)=>{
	try {
		const {thoi_gian,thanh_toan_id,ngay,nhan_vien_id,noi_dung,so_tien,trang_thai,ghi_chu,nguoi_sua,ngay_sua,ten_doi_tuong,dia_chi,dien_thoai,ma_so_thue,loai} = req.body
		const Kieu = req.params.Kieu
		var so_tien_new = so_tien
		if(so_tien_new.indexOf('₫') >0){
			
			so_tien_new = 	parseInt(so_tien.split('.').join("").split('₫').join("")).toString()
		}
		console.log(so_tien_new)
		const newTodo = await pool.query(`
		update tbl_thanh_toan set ngay='${ngay}',nhan_vien_id=${nhan_vien_id},noi_dung=N'${noi_dung}',so_tien=${so_tien_new},kieu=${Kieu},ghi_chu=N'${ghi_chu}',
		ngay_sua='${ngay_sua}',nguoi_tao=N'${nguoi_sua}',ten_doi_tuong=N'${ten_doi_tuong}',dia_chi=N'${dia_chi}',dien_thoai=N'${dien_thoai}',ma_so_thue=N'${ma_so_thue}'
		where thanh_toan_id = '${thanh_toan_id}'
		`)
		var ngay_viet_nam = (ngay_sua.split(' ')[0].split('-')[2].length > 1 ? ngay_sua.split(' ')[0].split('-')[2] : "0"+ngay_sua.split(' ')[0].split('-')[2]) + '-' + (ngay_sua.split(' ')[0].split('-')[1].length > 1 ? ngay_sua.split(' ')[0].split('-')[1] : '0'+ngay_sua.split(' ')[0].split('-')[1]) + '-' + ngay_sua.split(' ')[0].split('-')[0]
		// console.log(ngay_viet_nam)
		const TruyenDuLieuLen = await pool.query(`
		select TO_CHAR(ngay, 'DD/MM/YYYY HH24:MI:SS AM')"NgayText",* from tbl_thanh_toan where kieu = ${Kieu}
		and thanh_toan_id = '${thanh_toan_id}'
		`)
		console.log(TruyenDuLieuLen.rows)
		res.json(TruyenDuLieuLen.rows)
	} catch (error) {
		console.log(error)

	}
})
app.delete(`/CongNo`,async (req,res)=>{
	try {
		const {thanh_toan_id} = req.body
		const newTodo = await pool.query(`
		DELETE FROM tbl_thanh_toan WHERE thanh_toan_id = N'${thanh_toan_id}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
	//#endregion

//#region Thông kê báo cáo
app.get(`/SoNhap_Ban/:NgayHomNay/:Kieu` ,async(req,res)=>{
	try {
		const NgayHomNay = req.params.NgayHomNay
		console.log(NgayHomNay)
		const Kieu = req.params.Kieu
		// const NgayHomNay = "2021-02-03"
		const DSSoBan = await pool.query(`
		select tbl_hang.ma_hang,tbl_hang.ten_hang,sum(tbl_hoa_don_ban_chi_tiet.so_luong)"so_ban_tong",tbl_hang_ton_dau_ky.gia_ban_le,
		tbl_hang_ton_dau_ky.nha_san_xuat,tbl_dvt.ten_dvt
		from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet,tbl_hang,tbl_hang_ton_dau_ky,tbl_dvt
		
		where tbl_hoa_don_ban.hoa_don_ban_id =tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
		and tbl_dvt.dvt_id = tbl_hang.dvt_id
		and tbl_hang_ton_dau_ky.hang_id = tbl_hoa_don_ban_chi_tiet.hang_id
		and tbl_hang.hang_id = tbl_hoa_don_ban_chi_tiet.hang_id
		and date_part('day', tbl_hoa_don_ban.ngay) = ${NgayHomNay.split('-')[2]}
		and date_part('month', tbl_hoa_don_ban.ngay) = ${NgayHomNay.split('-')[1]}
		and date_part('year', tbl_hoa_don_ban.ngay) = ${NgayHomNay.split('-')[0]}
		group by tbl_hang.ten_hang,tbl_hang.ma_hang,tbl_hang_ton_dau_ky.gia_ban_le,
		tbl_hoa_don_ban_chi_tiet.nha_san_xuat
		`)
		console.log(DSSoBan.rows)
		const DSSoNhap = await pool.query(`
		select tbl_hang.ma_hang,tbl_hang.ten_hang,sum(tbl_phieu_nhap_chi_tiet.so_luong)"so_luong_nhap" ,tbl_hang_ton_dau_ky.gia_thuc_nhap,
		tbl_hoa_don_ban_chi_tiet.nha_san_xuat
		from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet,tbl_hang,
		tbl_hoa_don_ban_chi_tiet,tbl_dvt
		where 
		tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
		and tbl_hoa_don_ban_chi_tiet.hang_id = tbl_hang.hang_id
		and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
		and tbl_phieu_nhap_chi_tiet.hang_id = tbl_hang.hang_id
		and date_part('day', tbl_phieu_nhap.ngay) = ${NgayHomNay.split('-')[2]}
		and date_part('month', tbl_phieu_nhap.ngay) = ${NgayHomNay.split('-')[1]}
		and date_part('year', tbl_phieu_nhap.ngay) = ${NgayHomNay.split('-')[0]}
		group by tbl_hang.ten_hang,tbl_hang.ma_hang,tbl_hoa_don_ban_chi_tiet.gia_thuc_nhap,
		tbl_hoa_don_ban_chi_tiet.nha_san_xuat
		`)
		res.json(Kieu==='0'? DSSoNhap.rows :DSSoBan.rows)
		// DSSoNhap.rows.map
	} catch (error) {
		console.log(error)
	}
})

app.get('/SoNhap_BanTheoNgay/:Kieu/:NgayBatDau/:NgayKetThuc' , async (req,res)=>{
	try {
		const {NgayBatDau,NgayKetThuc,Kieu} = req.params
		// const NgayHomNay = "2021-02-03"
		const DSSoBan = await pool.query(`
		select tbl_hang.ma_hang,tbl_hang.ten_hang,sum(tbl_hoa_don_ban_chi_tiet.so_luong)"so_ban_tong",tbl_hang_ton_dau_ky.gia_ban_le,
		tbl_hang_ton_dau_ky.nha_san_xuat,tbl_dvt.ten_dvt
		from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet,tbl_hang,tbl_hang_ton_dau_ky,tbl_dvt
		where 
		tbl_dvt.dvt_id = tbl_hoa_don_ban_chi_tiet.dvt_id
		and tbl_hang_ton_dau_ky.hang_id = tbl_hang.hang_id
		and tbl_hoa_don_ban.hoa_don_ban_id =tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
		and tbl_hang.hang_id = tbl_hoa_don_ban_chi_tiet.hang_id
		and (tbl_hoa_don_ban.ngay >= '${NgayBatDau}' and tbl_hoa_don_ban.ngay <= '${NgayKetThuc}')
		group by tbl_hang.ten_hang,tbl_hang.ma_hang,tbl_hang_ton_dau_ky.gia_ban_le,
		tbl_hang_ton_dau_ky.nha_san_xuat,tbl_dvt.ten_dvt
		`)
		console.log(DSSoBan.rows)
		const DSSoNhap = await pool.query(`
		select tbl_hang.ma_hang,tbl_hang.ten_hang,sum(tbl_phieu_nhap_chi_tiet.so_luong)"so_luong_nhap" ,
		tbl_hang_ton_dau_ky.gia_thuc_nhap,
		tbl_hang_ton_dau_ky.nha_san_xuat,tbl_dvt.ten_dvt
			from tbl_phieu_nhap,tbl_phieu_nhap_chi_tiet,tbl_hang,
			tbl_hoa_don_ban_chi_tiet,tbl_dvt,tbl_hang_ton_dau_ky
		where 
			tbl_hang_ton_dau_ky.hang_id = tbl_hang.hang_id
			and tbl_hang_ton_dau_ky.dvt_id = tbl_dvt.dvt_id
			and tbl_hoa_don_ban_chi_tiet.hang_id = tbl_hang.hang_id
			and tbl_phieu_nhap.phieu_nhap_id = tbl_phieu_nhap_chi_tiet.phieu_nhap_id
			and tbl_phieu_nhap_chi_tiet.hang_id = tbl_hang.hang_id
			and (tbl_phieu_nhap.ngay >= '${NgayBatDau}' and tbl_phieu_nhap.ngay <= '${NgayKetThuc}')
			group by tbl_hang.ten_hang,tbl_hang.ma_hang,
					tbl_hang_ton_dau_ky.gia_thuc_nhap,
		tbl_hang_ton_dau_ky.nha_san_xuat,tbl_dvt.ten_dvt
		`)
		res.json(Kieu==='0'? DSSoNhap.rows :DSSoBan.rows)
	} catch (error) {
		console.log(error)
	}
})





app.get(`/ThongKeBankingBanHang/:NgayHomNay` , async (req,res)=>{
	try {
		const NgayHomNay = req.params.NgayHomNay
		console.log(NgayHomNay)
		const TienHienTai = await pool.query(`
			select sum(tbl_hoa_don_ban.tong_gia_tri) from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet
			where tbl_hoa_don_ban.hoa_don_ban_id = tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
			and date_part('day', tbl_hoa_don_ban_chi_tiet.ngay_tao) = ${NgayHomNay.split('-')[2]}
			and date_part('month', tbl_hoa_don_ban_chi_tiet.ngay_tao) = ${NgayHomNay.split('-')[1]}
			and date_part('year', tbl_hoa_don_ban_chi_tiet.ngay_tao) = ${NgayHomNay.split('-')[0]}
		`)
		console.log(TienHienTai.rows)
		res.json(TienHienTai.rows)
	} catch (error) {
		
	}
})
//#endregion
















//#region Thiết lập lương nhân viên
app.get(`/HienThiCaNhanVien` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
			select tbl_nhan_vien.ma_nhan_vien,* from tbl_gio_cong,tbl_lich_nhan_vien,tbl_nhan_vien
			where tbl_gio_cong.gio_cong_id = tbl_lich_nhan_vien.gio_cong_id
			and tbl_nhan_vien.nhan_vien_id = tbl_lich_nhan_vien.nhan_vien_id
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.post('/ThietLapCaNhanVien',async (req,res)=>{
	try {
			const DL = req.body
			// console.log(DL)
			const newTodo = await pool.query(`
			select * from tbl_lich_nhan_vien,tbl_gio_cong
			where tbl_lich_nhan_vien.gio_cong_id = tbl_gio_cong.gio_cong_id and
			tbl_lich_nhan_vien.nhan_vien_id = 
			(SELECT nhan_vien_id from tbl_nhan_vien where ma_nhan_vien = N'${DL[0].ma_nhan_vien}')
			and date_part('day',tbl_lich_nhan_vien.ngay) = ${DL[0].ngay.split('-')[2]}
			and date_part('month',tbl_lich_nhan_vien.ngay) = ${DL[0].ngay.split('-')[1]}
			and date_part('year',tbl_lich_nhan_vien.ngay) = ${DL[0].ngay.split('-')[0]}
			`)
			if(newTodo.rowCount===0){
				const tbl_gio_cong = await pool.query(`
					insert into tbl_gio_cong(ca_lam_viec)
					values (N'${JSON.stringify(DL)}')
				`)
				const tbl_lich_nhan_vien = await pool.query(`
					insert into tbl_lich_nhan_vien(
						ngay,nhan_vien_id,gio_cong_id
					)
					values ('${DL[0].ngay}',
					(SELECT nhan_vien_id from tbl_nhan_vien where ma_nhan_vien = N'${DL[0].ma_nhan_vien}'),
					(select gio_cong_id from tbl_gio_cong where ca_lam_viec = 
					N'${JSON.stringify(DL)}')
					)
				`)
			}
			else{
					const tesst = JSON.parse(newTodo.rows[0].ca_lam_viec)
					// console.log(tesst)
					const ca_lam_viec =[{
						ma_nhan_vien : tesst[0].ma_nhan_vien,
						ten_nhan_vien : tesst[0].ten_nhan_vien,
						ngay : tesst[0].ngay,
						gio_vao : (DL[0].gio_vao!=undefined ? DL[0].gio_vao : tesst[0].gio_vao),
						gio_ra : (DL[0].gio_ra!=undefined ? DL[0].gio_ra : tesst[0].gio_ra)
					}]
					// console.log(ca_lam_viec)
					// Cập nhập giờ vào giờ ra 
					const tbl_gio_cong_ca_lam_viec = await pool.query(`
						update tbl_gio_cong set ca_lam_viec = N'${JSON.stringify(ca_lam_viec)}'
						where gio_cong_id = ${newTodo.rows[0].gio_cong_id}
					`)
			}
			// console.log(newTodo.rowCount===0)
	} catch (error) {
		console.log(error)
	}
})

app.post('/CheckRaVaoNhanVien' , async (req,res)=>{
	try {
		const {ngay_gio_hien_tai,e,check} = req.body
		console.log({ngay_gio_hien_tai,e,check})
		// ngay_gio_hien_tai '2021-2-11 0:59:33'
		// e giá trị mã nhân viên nhập từ trên client
		const newTodo = await pool.query(`
		select * from tbl_gio_cong,tbl_lich_nhan_vien
		where tbl_gio_cong.gio_cong_id = tbl_lich_nhan_vien.gio_cong_id
		and date_part('day', ngay) = ${ngay_gio_hien_tai.split(' ')[0].split('-')[2]}
		and date_part('month', ngay) = ${ngay_gio_hien_tai.split(' ')[0].split('-')[1]}
		and date_part('year', ngay) = ${ngay_gio_hien_tai.split(' ')[0].split('-')[0]}
		and tbl_lich_nhan_vien.nhan_vien_id = (
			select nhan_vien_id from tbl_nhan_vien where ma_nhan_vien= N'${e}'
		)
		`)
		const TenNV = await pool.query(`
		select ten_nhan_vien from tbl_nhan_vien where ma_nhan_vien = N'${e}'
		`)
		if(newTodo.rows.length > 0){
			console.log(newTodo.rows)
			const CapNhapGioVaoRaNhanVien = await pool.query(
				check ?
				`update tbl_gio_cong set gio_vao = '${ngay_gio_hien_tai}' where gio_cong_id = ${newTodo.rows[0].gio_cong_id}` :
				`update tbl_gio_cong set gio_ra = '${ngay_gio_hien_tai}' where gio_cong_id = ${newTodo.rows[0].gio_cong_id}`
				) 
			res.json('Check '+ (check ? 'vào': 'ra') + ' thành công !\n'+'Xin chào nhân viên : '+TenNV.rows[0].ten_nhan_vien)
		}else{
			res.json('Lỗi nhân viên chưa thiết lập trên lịch làm !')
		}
		// console.log(TenNV.rows[0].ten_nhan_vien)
		console.log(newTodo.rows.length > 0)
		// res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})
//#endregion

//#endregion
const GioVaoRaCaLamViec = (str,check)=>{
	try {
		const DL = JSON.parse(str)
		return (check ? DL[0].gio_vao : DL[0].gio_ra)
	} catch (error) {
		
	}
}

app.get('/ChotLuongNhanVien',async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_lich_nhan_vien,tbl_gio_cong,tbl_nhan_vien
		where tbl_lich_nhan_vien.gio_cong_id = tbl_gio_cong.gio_cong_id
		and tbl_lich_nhan_vien.nhan_vien_id = tbl_nhan_vien.nhan_vien_id
		
		
		`)
		// console.log(newTodo.rows)

		const DuLieuTruyenLen = []
		newTodo.rows.map(x=>{
			_ngay = new Date( (Date.parse(x.ngay)) ).getDate()+ '-'+  ( new Date( (Date.parse(x.ngay)) ).getMonth() +1) +'-'+ new Date( (Date.parse(x.ngay)) ).getFullYear() 
			DuLieuTruyenLen.push({
				lich_nhan_vien_id : x.lich_nhan_vien_id,
				ma_nhan_vien : x.ma_nhan_vien,
				ten_nhan_vien : x.ten_nhan_vien,
				ngay_cong : x.ngay_cong,
				ngay : _ngay,
				ngay_ca_lam_viec : GioVaoRaCaLamViec(x.ca_lam_viec,true) +'->' + GioVaoRaCaLamViec(x.ca_lam_viec,false),
				gio_vao :  new Date( Date.parse(x.gio_vao) ).getHours()+':'+new Date( Date.parse(x.gio_vao) ).getMinutes() +':'+new Date( Date.parse(x.gio_vao) ).getSeconds(),
				gio_ra : new Date( Date.parse(x.gio_ra) ).getHours()+':'+new Date( Date.parse(x.gio_ra) ).getMinutes() +':'+new Date( Date.parse(x.gio_ra) ).getSeconds()
			})
		}
		)
		console.log(DuLieuTruyenLen)
		res.json(DuLieuTruyenLen)
	} catch (error) {
		console.log(error)
	}
}
)
app.get('/ChotLuongNhanVien/:NgayBatDau/:NgayKetThuc',async (req,res)=>{
	try {
		const {NgayBatDau,NgayKetThuc} = req.params
		const newTodo = await pool.query(`
		select * from tbl_lich_nhan_vien,tbl_gio_cong,tbl_nhan_vien
		where tbl_lich_nhan_vien.gio_cong_id = tbl_gio_cong.gio_cong_id
		and tbl_lich_nhan_vien.nhan_vien_id = tbl_nhan_vien.nhan_vien_id
		and (tbl_lich_nhan_vien.ngay)
		
		`)
		// console.log(newTodo.rows)

		const DuLieuTruyenLen = []
		newTodo.rows.map(x=>{
			_ngay = new Date( (Date.parse(x.ngay)) ).getDate()+ '-'+  ( new Date( (Date.parse(x.ngay)) ).getMonth() +1) +'-'+ new Date( (Date.parse(x.ngay)) ).getFullYear() 
			DuLieuTruyenLen.push({
				lich_nhan_vien_id : x.lich_nhan_vien_id,
				ma_nhan_vien : x.ma_nhan_vien,
				ten_nhan_vien : x.ten_nhan_vien,
				ngay_cong : x.ngay_cong,
				ngay : _ngay,
				ngay_ca_lam_viec : GioVaoRaCaLamViec(x.ca_lam_viec,true) +'->' + GioVaoRaCaLamViec(x.ca_lam_viec,false),
				gio_vao :  new Date( Date.parse(x.gio_vao) ).getHours()+':'+new Date( Date.parse(x.gio_vao) ).getMinutes() +':'+new Date( Date.parse(x.gio_vao) ).getSeconds(),
				gio_ra : new Date( Date.parse(x.gio_ra) ).getHours()+':'+new Date( Date.parse(x.gio_ra) ).getMinutes() +':'+new Date( Date.parse(x.gio_ra) ).getSeconds()
			})
		}
		)
		console.log(DuLieuTruyenLen)
		res.json(DuLieuTruyenLen)
	} catch (error) {
		console.log(error)
	}
}
)
// NOTE

// select * from tbl_gio_cong,tbl_lich_nhan_vien
// where tbl_gio_cong.gio_cong_id = tbl_lich_nhan_vien.gio_cong_id
// and tbl_lich_nhan_vien.nhan_vien_id = (select nhan_vien_id from tbl_nhan_vien where ma_nhan_vien = N'NV0001')
// NOTE



// API Đăng nhập đăng ký LUCLAC.vn

app.post('/DangKyTaiKhoanLucLac' , async (req,res)=>{
	try {
		
		const {TaiKhoan,MatKhau,DienThoai,DiaChi,HoVaTen,Email}= req.body
		// console.log({TaiKhoan,TenVaTenDem,DiaChi,Ho,SDT,Email,MatKhau})
		const newTodo = await pool.query(`
			select * from tbl_bang_tai_khoan_khach_hang
			where tai_khoan_khach = N'${TaiKhoan}'
		`)
		if(newTodo.rows.length > 0){
			res.json({
				status:2,
				data:[],
				message:'Tài khoản đã có trong hệ thống!'
			})
		}else{
			const DoiTuong = await pool.query(`
				select * from tbl_doi_tuong
			`)
			console.log(fnc.MaDT(DoiTuong.rows))
			const newTodo = await pool.query(`
				INSERT INTO tbl_doi_tuong(
					loai_doi_tuong_id,ma_doi_tuong,ten_doi_tuong,dia_chi,dien_thoai
				)
				VALUES(1,'${fnc.MaDT(DoiTuong.rows)}',N'${HoVaTen+' - ' + TaiKhoan}' , N'${DiaChi}',N'${DienThoai}');
				
			`)
			const taotaikhoan = await pool.query(`
			insert into tbl_bang_tai_khoan_khach_hang(
				tai_khoan_khach,mat_khau_khach,doi_tuong_id,tich_diem,email
			)
			values(
				N'${TaiKhoan}',N'${MatKhau}',(SELECT doi_tuong_id from tbl_doi_tuong where ma_doi_tuong = N'${fnc.MaDT(DoiTuong.rows)}'),0,N'${Email}'
			)
			`)
			res.json({
				status:1,
				data:'',
				message: ` Đăng ký tài khoản người dùng ${TaiKhoan} thành công! `
			})
		}
		
	} catch (error) {
		console.log(error)
		res.json({
			status:0,
			data:[],
			message:'Tài khoản đã có trong hệ thống!'
		})
	}
})

app.post(`/DangNhapLucLac` , async (req,res)=>{
	try {
		// {TaiKhoan,MatKhau}
		const {TaiKhoan,MatKhau} = req.body

		console.log()
		const newTodo = await pool.query(`
			select tai_khoan_khach,doi_tuong_id,tich_diem,email from tbl_bang_tai_khoan_khach_hang
			where tai_khoan_khach = N'${TaiKhoan}' and mat_khau_khach = N'${MatKhau}'
		`)
		
		if(newTodo.rows.length > 0 ){
			res.json({
				status:1,
				data:newTodo.rows,
				message:`Đăng nhập tài khoản thành công !`
			})
		}else{
			res.json({
				status:0,
				data:[],
				message:`Đăng nhập thất bại !`
			})
		}

	} catch (error) {
		
	}
})

// API Đăng nhập đăng ký LUCLAC.vn



app.get(`/KhuVucMien` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_nganh_hang,tbl_khu_vuc_mien
		where
		tbl_khu_vuc_mien.id_khu_vuc_mien =  tbl_nganh_hang.id_khu_vuc_mien
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get(`/KhuVuc/:ma_nganh_hang` , async (req,res)=>{
	try {
		const {ma_nganh_hang}= req.params

		const newTodo = await pool.query(`
		select * from tbl_loai_hang
		where nganh_hang_id = (
			select nganh_hang_id from tbl_nganh_hang where ma_nganh_hang = N'${ma_nganh_hang}'
		)
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})



// Params
//`IP/SanPhamCuaLoaiHang/17`
// fetch(`IP/SanPhamCuaLoaiHang/17`)
app.get('/PhongTapTrongKhuVuc/:loai_hang_id' , async (req,res)=>{
	try {
		const {loai_hang_id} = req.params
		const newTodo = await pool.query(`
			select * from tbl_hang,tbl_hang_ton_dau_ky where 
			tbl_hang.loai_hang_id = ${loai_hang_id}
			and tbl_hang_ton_dau_ky.hang_id = tbl_hang.hang_id
		`)
		// Gửi lên
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


// Đăng nhập nguời dùng

app.post(`/DangNhapND` , async (req,res)=>{
	try {
		const {TaiKhoan,MatKhau} = req.body

		const newTodo = await pool.query(`
			select * from tbl_bang_tai_khoan_khach_hang
			where tai_khoan_khach = N'${TaiKhoan}'
			and mat_khau_khach = N'${MatKhau}'
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.post('/DangKyND' , async (req,res)=>{
	try {
		
	} catch (error) {
		
	}
})


app.get(`/TichDiemCuaKhach/:TaiKhoanKhach` , async (req,res)=>{
	try {
		const {TaiKhoanKhach} = req.params

		const newTodo = await pool.query(`
			select tich_diem from tbl_bang_tai_khoan_khach_hang
			where tai_khoan_khach = N'${TaiKhoanKhach}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


// POST

app.post(`/NapTienKhachHang` , async (req,res)=>{
	try {
		const {doi_tuong_id,noi_dung_nap,id_tk_khach,so_tien} = req.body
		const newTodo  = await pool.query(`
		insert into tbl_nap_tien(doi_tuong_id,noi_dung_nap,trang_thai,id_tk_khach,tien_nap,ngay_nap)
		values(
			${doi_tuong_id},N'${noi_dung_nap}',false,${id_tk_khach},${so_tien},'${fnc.tg_pgadmin}'
		)
		`)
			res.json({
				status:1
			})
	} catch (error) {
		console.log(error)
		res.json({
			status:0
		})
	}
})

app.get(`/HienThiChiTietPhong/:ma_hang` , async (req,res)=>{
	try {
		const {ma_hang} = req.params
		const newTodo = await pool.query(`
			select * from tbl_hang,tbl_hang_ton_dau_ky
			where tbl_hang.hang_id=tbl_hang_ton_dau_ky.hang_id
			and tbl_hang.ma_hang = N'${ma_hang}' 
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get(`/HienThiGioTap/:ma_hang` , async (req,res)=>{
	try {
		const {ma_hang} = req.params
		console.log(ma_hang)
		const newTodo = await pool.query(`
			select * from tbl_chi_phi_tap
			where hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
} )


app.post('/DatLichTap' , async (req,res)=>{
	try {

		const {DL,tong_so_coin} = req.body

		console.log({DL,tong_so_coin})
		console.log(DL[0].DangNhapFitNess.map(x=>x.tai_khoan_khach).toString())


		const so_coin_khach = await pool.query(`
			select tich_diem from tbl_bang_tai_khoan_khach_hang
			where tai_khoan_khach = N'${DL[0].DangNhapFitNess.map(x=>x.tai_khoan_khach).toString()}'
		`)
		let coin_cu = parseInt(so_coin_khach.rows[0].tich_diem)
		const capnhapcoinkhach= await pool.query(`
			update tbl_bang_tai_khoan_khach_hang set tich_diem = ${coin_cu-tong_so_coin}
			where tai_khoan_khach = N'${DL[0].DangNhapFitNess.map(x=>x.tai_khoan_khach).toString()}'
		`)
		// Đặt lịch
		const ngay_tao = fnc.tg_pgadmin
		console.log(ngay_tao)
		const lichtap = await pool.query(`
			insert into tbl_lich_tap_khach
			(doi_tuong_id,ngay_tao,tong_coin)
			values(${DL[0].DangNhapFitNess.map(x=>x.doi_tuong_id).toString()},'${ngay_tao}',${tong_so_coin})
		`)
		console.log(lichtap)
		DL.map(async (x)=>{
			const lichtapchitiet = await pool.query(`
				insert into tbl_lich_tap_khach_chi_tiet(ngay_tap,phi,noi_dung,id_tk_khach,id_lich_tap_khach,hang_id,check_in_tong)
				values(${x.ngay_tap},${x.giatri.kinh_phi},N'${x.giatri.noi_dung_chi_tiet}',${x.DangNhapFitNess[0].id_tk_khach},(
					select id_lich_tap_khach from tbl_lich_tap_khach where ngay_tao = '${ngay_tao}'
				),( select hang_id  from tbl_hang where ma_hang = N'${x.ma_hang}'),0
				)
			`)
			console.log(lichtapchitiet)
		})
		res.json({
			status:1,

		})
	} catch (error) {
		console.log(error)
		res.json({
			status:0,
		})
	}
})

app.get('/HinhAnhTap/:ma_hang' , async (req,res)=>{
	try {
		const {ma_hang} = req.params

		const newTodo = await pool.query(`
			select duong_link from tbl_hang_ton_dau_ky,tbl_hang
			where hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get(`/PhongTapNhieuNhat/:ten_nganh_hang` , async (req,res)=>{
	try {
		const {ten_nganh_hang} = req.params
		// console.log(ten_nganh_hang)
		const newTodo = await pool.query(`
			select COUNT(*)"dem",tbl_hang.ten_hang,tbl_hang.ma_hang,tbl_hang_ton_dau_ky.gia_ban_le,tbl_hang.hang_id,
			tbl_hang_ton_dau_ky.duong_link
			from tbl_hang,tbl_hang_ton_dau_ky,tbl_loai_hang,tbl_nganh_hang,tbl_lich_tap_khach_chi_tiet
			where tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
			and tbl_hang.loai_hang_id = tbl_loai_hang.loai_hang_id
			and tbl_hang.hang_id = tbl_hang_ton_dau_ky.hang_id
			and tbl_lich_tap_khach_chi_tiet.hang_id = tbl_hang.hang_id
			and tbl_nganh_hang.ten_nganh_hang = N'${ten_nganh_hang}'
			group by tbl_hang.ten_hang,tbl_hang.ma_hang,tbl_hang_ton_dau_ky.gia_ban_le,tbl_hang.hang_id,tbl_hang_ton_dau_ky.duong_link
			ORDER BY dem DESC
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get('/HienThiGiaCoinTap/:hang_id' , async(req,res) =>{
	try {
		const {hang_id} = req.params

		const newTodo = await pool.query(`

	select * from tbl_chi_phi_tap
	where hang_id = ${hang_id}
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.post('/GuiLienHe'  ,async (req,res)=>{
	try {
		const {ten_day_du,email,tieu_de,noi_dung,ngay} = req.body
		console.log({ten_day_du,email,tieu_de,noi_dung,ngay})
		const newTodo = await pool.query(`
			insert into tbl_lien_he(ten_day_du,email,tieu_de,noi_dung,ngay)
			values(N'${ten_day_du}',N'${email}',N'${tieu_de}',N'${noi_dung}','${fnc.tg_pgadmin}')
		`)
		res.json('')
	} catch (error) {
		console.log(error)
	}
})


app.get(`/KhachHangTap` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_doi_tuong
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.get('/NapTienKhachHang/:trang_thai' , async (req,res)=>{
	try {
		const {trang_thai} = req.params
		
		const newTodo = await pool.query(`
			select TO_CHAR(tbl_nap_tien.ngay_nap,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_nap_tien,tbl_bang_tai_khoan_khach_hang
			where tbl_bang_tai_khoan_khach_hang.id_tk_khach = tbl_nap_tien.id_tk_khach
			and tbl_nap_tien.trang_thai = ${trang_thai}
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})
app.get('/NapTienKhachHang/:trang_thai/:ngay_bat_dau/:ngay_ket_thuc' , async (req,res)=>{
	try {
		const {trang_thai,ngay_bat_dau,ngay_ket_thuc} = req.params
		
		console.log(trang_thai,ngay_bat_dau,ngay_ket_thuc)
		const newTodo = await pool.query(`
			select TO_CHAR(tbl_nap_tien.ngay_nap,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_nap_tien,tbl_bang_tai_khoan_khach_hang
			where tbl_bang_tai_khoan_khach_hang.id_tk_khach = tbl_nap_tien.id_tk_khach
			and tbl_nap_tien.trang_thai = ${trang_thai}
			and (tbl_nap_tien.ngay_nap >= '${ngay_bat_dau}' and tbl_nap_tien.ngay_nap <= '${ngay_ket_thuc}')
		`)
		console.log(newTodo.rows)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})

app.get('/XacNhanNapTienKhach/:token/:id_nap' , async (req,res)=>{
	try {
		const {id_nap,token} = req.params
		// const {}
		console.log(token)
		if(token==='qwqrn12jr12iorj21klrn9445*1223'){
			const tien_nap = await pool.query(`
			select * from tbl_nap_tien where id_nap = ${id_nap}
			`)
			console.log(
				id_nap
			)

			const updatetaikhoancoint = await pool.query(`
				update tbl_bang_tai_khoan_khach_hang set tich_diem=(
				 (
					select tich_diem from tbl_bang_tai_khoan_khach_hang where id_tk_khach = ${tien_nap.rows.map(x=>x.id_tk_khach).toString()}
					) + ${ parseInt(tien_nap.rows.map(x=>x.tien_nap).toString() ) /1000} )
					where id_tk_khach = ${tien_nap.rows.map(x=>x.id_tk_khach).toString()}
			`)
			const update_trang_thai = await pool.query(`
			update tbl_nap_tien set trang_thai = true where id_nap = ${id_nap}
			`)
			res.json({
				status:1,
				
			})
		}else{
			res.json({
				status:0,
				
			})
		}
		
	} catch (error) {
		console.log(error)
	}
})

app.get('/tokenFitNess' , async (req,res)=>{
	try {
		res.json('qwqrn12jr12iorj21klrn9445*1223')
	} catch (error) {
		
	}
})


app.get('/LichSuDatLichTap/:id_tk_khach' , async (req,res)=>{
	try {
		const {id_tk_khach} = req.params

		const newTodo = await pool.query(`
			select SUM(tbl_lich_tap_khach_chi_tiet.ngay_tap)"tong_dat",SUM(tbl_lich_tap_khach_chi_tiet.check_in_tong)"so_check",tbl_hang_ton_dau_ky.duong_link,
			tbl_hang.ten_hang,tbl_lich_tap_khach_chi_tiet.noi_dung,tbl_hang.ma_hang
			
			from tbl_lich_tap_khach,tbl_hang,
			tbl_lich_tap_khach_chi_tiet,tbl_hang_ton_dau_ky
			where 
			tbl_hang_ton_dau_ky.hang_id = tbl_hang.hang_id and
			tbl_lich_tap_khach.id_lich_tap_khach = tbl_lich_tap_khach_chi_tiet.id_lich_tap_khach and
			tbl_hang.hang_id = tbl_lich_tap_khach_chi_tiet.hang_id
			and tbl_lich_tap_khach_chi_tiet.id_tk_khach = ${id_tk_khach}
			group by tbl_hang.ten_hang,tbl_hang_ton_dau_ky.duong_link,tbl_lich_tap_khach_chi_tiet.noi_dung,tbl_hang.ma_hang
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.post('/TimKiemDatLichTap' , async(req,res)=>{
	try {

		const {id_tk_khach,ma_hang,ten_phong} = req.body
		const newTodo = await pool.query(`
		select SUM(tbl_lich_tap_khach_chi_tiet.ngay_tap)"tong_dat",SUM(tbl_lich_tap_khach_chi_tiet.check_in_tong)"so_check",tbl_hang_ton_dau_ky.duong_link,
		tbl_hang.ten_hang,tbl_lich_tap_khach_chi_tiet.noi_dung,tbl_hang.ma_hang
		
		from tbl_lich_tap_khach,tbl_hang,
		tbl_lich_tap_khach_chi_tiet,tbl_hang_ton_dau_ky
		where 
		tbl_hang_ton_dau_ky.hang_id = tbl_hang.hang_id and
		tbl_lich_tap_khach.id_lich_tap_khach = tbl_lich_tap_khach_chi_tiet.id_lich_tap_khach and
		tbl_hang.hang_id = tbl_lich_tap_khach_chi_tiet.hang_id
		and tbl_lich_tap_khach_chi_tiet.id_tk_khach = ${id_tk_khach}
		
		${ma_hang === '' ? '' : `and tbl_hang.ma_hang = N'${ma_hang}'`}
		${ten_phong === '' ? '' : `and LOWER(convertTVkdau(tbl_hang.ten_hang)) LIKE LOWER(convertTVkdau(N'%${ten_phong}%'))`}


		group by tbl_hang.ten_hang,tbl_hang_ton_dau_ky.duong_link,tbl_lich_tap_khach_chi_tiet.noi_dung,tbl_hang.ma_hang
	`)

	res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.post('/CheckInVaoKhachHang' , async(req,res)=>{
	try {
		const {ma_hang,ten_hang,ngay_checkin,DangNhapFitNess,noi_dung} = req.body

		// console.log( {ma_hang,ten_hang,ngay_checkin,DangNhapFitNess,noi_dung})
		const date = new Date()
		const ktrakhachcheck = await pool.query(`
		select * from tbl_lich_su_check_in
		where date_part('day', ngay_check) = ${date.getDate()}
		and date_part('month', ngay_check) = ${parseInt(date.getMonth())+1} and date_part('year', ngay_check) = ${date.getFullYear()}
		and hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
		and id_tk_khach = ${JSON.parse(DangNhapFitNess).map(x=>x.id_tk_khach).toString()}
		`)
		// console.log(ktrakhachcheck.rows)
		if(ktrakhachcheck.rows.length > 0){
			console.log('tesst')
			res.json({
				status:2,
				message:'Khách đã check-in',
				date : ktrakhachcheck.rows,
			})
			
		}else{
			const ktra = await pool.query(`
			select sum(ngay_tap)"ngay_tap",sum(check_in_tong)"check_in_tong" from tbl_lich_tap_khach_chi_tiet where
			id_tk_khach = ${JSON.parse(DangNhapFitNess).map(x=>x.id_tk_khach).toString()} and
			hang_id =(select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
			`)
			if( parseInt(ktra.rows[0].ngay_tap) >  parseInt(ktra.rows[0].check_in_tong) ){
				// console.log(JSON.parse(DangNhapFitNess).map(x=>x.id_tk_khach).toString())
				const dulieuchinhsua = await pool.query(`
					select * from tbl_lich_tap_khach_chi_tiet 
					where hang_id = (select hang_id from tbl_hang where ma_hang = N'${ma_hang}')
					and id_tk_khach = ${JSON.parse(DangNhapFitNess).map(x=>x.id_tk_khach).toString()}
					LIMIT 1
				`)
	
				const updatedl = await pool.query(`
					update tbl_lich_tap_khach_chi_tiet set check_in_tong = ${parseInt(dulieuchinhsua.rows[0].check_in_tong)+1}
					where id_lich_tap_khach_ct = ${dulieuchinhsua.rows[0].id_lich_tap_khach_ct}
				`)
				const lich_su = await pool.query(`
				insert into tbl_lich_su_check_in(noi_dung_check,ngay_check,hang_id,id_tk_khach)
				values(N'${noi_dung}','${fnc.convert(ngay_checkin)}',(select hang_id from tbl_hang where ma_hang = N'${ma_hang}'),
				${JSON.parse(DangNhapFitNess).map(x=>x.id_tk_khach).toString()}
				)
				`)
				// console.log(dulieuchinhsua.rows)
				res.json({
					status:1,
					message:'Checkin thành công!'
				})
			}else{
				res.json({
					status:0,
					message:'Người dùng đã checkin đủ số buổi'
				})
			}
		}

	} catch (error) {
		console.log(error)
	}
} )


app.get('/LichSuNapTienKhachHang/:id_tk_khach' , async (req,res)=>{
	try {
		const {id_tk_khach} = req.params

		const newTodo = await pool.query(`
			select TO_CHAR(ngay_nap,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_nap_tien
			where id_tk_khach = ${id_tk_khach}
			ORDER BY ngay_nap DESC
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get('/LichSuNapTienKhachHang/:id_tk_khach/:ngay_bat_dau/:ngay_ket_thuc' , async (req,res)=>{
	try {
		const {id_tk_khach,ngay_bat_dau,ngay_ket_thuc} = req.params

		const newTodo = await pool.query(`
			select TO_CHAR(ngay_nap,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT",* from tbl_nap_tien
			where id_tk_khach = ${id_tk_khach}
			and (ngay_nap >= '${ngay_bat_dau}' and ngay_nap <= '${ngay_ket_thuc}')
			ORDER BY ngay_nap DESC
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.get(`/LienHe` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select *,TO_CHAR(ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT" from tbl_lien_he
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.get(`/LienHe/:ngay_bat_dau/:ngay_ket_thuc` , async (req,res)=>{
	try {
		const {ngay_bat_dau,ngay_ket_thuc} = req.params
		
		const newTodo = await pool.query(`
		select *,TO_CHAR(ngay,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT" from tbl_lien_he
		where (ngay >= '${ngay_bat_dau}' and ngay <= '${ngay_ket_thuc}')
		`)
		console.log(newTodo.rows)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})


app.get('/SoLuongTapTrongNgay' , async(req,res)=>{
	try {
		const newTodo = await pool.query(`
		select *,TO_CHAR(tbl_lich_su_check_in.ngay_check,'DD-MM-YYYY HH24:MI:SS AM')"Ngay_Check" from tbl_lich_su_check_in,tbl_bang_tai_khoan_khach_hang,tbl_hang
		where tbl_lich_su_check_in.id_tk_khach = tbl_bang_tai_khoan_khach_hang.id_tk_khach and
		tbl_hang.hang_id = tbl_lich_su_check_in.hang_id
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get('/SoLuongTapTrongNgay/:ngay_bat_dau/:ngay_ket_thuc' , async (req,res)=>{
	try {
		const {ngay_bat_dau,ngay_ket_thuc} = req.params
		
		const newTodo = await pool.query(`
		select *,TO_CHAR(tbl_lich_su_check_in.ngay_check,'DD-MM-YYYY HH24:MI:SS AM')"Ngay_Check" from tbl_lich_su_check_in,tbl_bang_tai_khoan_khach_hang,tbl_hang
		where tbl_lich_su_check_in.id_tk_khach = tbl_bang_tai_khoan_khach_hang.id_tk_khach and
		tbl_hang.hang_id = tbl_lich_su_check_in.hang_id
		and (tbl_lich_su_check_in.ngay_check >= '${ngay_bat_dau}' and tbl_lich_su_check_in.ngay_check <= '${ngay_ket_thuc}')
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})



app.get('/DoanhThuTrongNgay'  , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select *,TO_CHAR(tbl_lich_tap_khach.ngay_tao,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT" from 
		tbl_lich_tap_khach,tbl_lich_tap_khach_chi_tiet,tbl_bang_tai_khoan_khach_hang
		where tbl_lich_tap_khach.id_lich_tap_khach = tbl_lich_tap_khach_chi_tiet.id_lich_tap_khach 
		and tbl_lich_tap_khach_chi_tiet.id_tk_khach =tbl_bang_tai_khoan_khach_hang.id_tk_khach
		
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})

app.get('/DoanhThuTrongNgay/:ngay_bat_dau/:ngay_ket_thuc'  , async (req,res)=>{
	try {
		const {ngay_bat_dau,ngay_ket_thuc} = req.params
		const newTodo = await pool.query(`
		select *,TO_CHAR(tbl_lich_tap_khach.ngay_tao,'DD-MM-YYYY HH24:MI:SS AM')"NgayFORMAT" from tbl_lich_tap_khach,tbl_lich_tap_khach_chi_tiet,tbl_bang_tai_khoan_khach_hang
		where tbl_lich_tap_khach.id_lich_tap_khach = tbl_lich_tap_khach_chi_tiet.id_lich_tap_khach 
		and tbl_lich_tap_khach_chi_tiet.id_tk_khach =tbl_bang_tai_khoan_khach_hang.id_tk_khach
		and (tbl_lich_tap_khach.ngay_tao >= '${ngay_bat_dau}' and tbl_lich_tap_khach.ngay_tao <= '${ngay_ket_thuc}')
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.post('/TimKiemPhongTap' , async(req,res)=>{
	try {
		const {nganh_hang_id,ten_loai_hang,tendulieu} = req.body
		console.log({nganh_hang_id,ten_loai_hang,tendulieu})
		var query = `
		select * from tbl_nganh_hang,tbl_loai_hang,
		tbl_hang,tbl_hang_ton_dau_ky
		where tbl_nganh_hang.nganh_hang_id = tbl_loai_hang.nganh_hang_id
		and tbl_loai_hang.loai_hang_id = tbl_hang.loai_hang_id
		and tbl_hang.hang_id = tbl_hang_ton_dau_ky.hang_id

		${nganh_hang_id === '' ? '' : `and tbl_nganh_hang.nganh_hang_id = ${nganh_hang_id}`}
		${ten_loai_hang === '' ? '' : `and tbl_loai_hang.ten_loai_hang = N'${ten_loai_hang}'`}
		${tendulieu === '' ? '' : `and LOWER(convertTVkdau(tbl_hang.ten_hang)) LIKE LOWER(convertTVkdau(N'%${tendulieu}%'))`}
		`
		const newTodo = await pool.query(query)

		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})

const cheerio = require('cheerio'); // khai báo module cheerio

const request = require('request-promise'); // khai báo module request-promise





const fs = require("fs");



app.get(`/LayDuLieuBitCoin`, async (req,res)=>{
	try {

		//#region BTC
			let BTC = {
				url: 'https://remitano.com/btc/vn',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
				}
			};
			const btc = []
			request(BTC, async (error, response, html) => {
			// console.log(response.statusCode)
				if(!error && response.statusCode == 200) {
				const $ = cheerio.load(html);
				
				$('.amount').each((index, el)=>{
					btc.push(el.children.map(x=>x.data).toString())

				})
				// console.log(btc)

					const newTodo = await pool.query(
						`update tien_coin set bitcoin_mua = ${btc[0].split(',').join('')}, bitcoin_ban = ${btc[1].split(',').join('')} where id_tien_coin = 1`
					)
				}
				else {
				console.log(error);
				}
			});
		//#endregion

		//#region Litecoin
		let LTC = {
			url: 'https://remitano.com/ltc/vn',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
			}
			
		};
		const lite = []
		request(LTC, async (error, response, html) => {
		// console.log(response.statusCode)
			if(!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			
			$('.amount').each((index, el)=>{
				lite.push(el.children.map(x=>x.data).toString())

			})
			// console.log(lite)

				const newTodo = await pool.query(
					`update tien_coin set litcoin_mua = ${lite[0].split(',').join('')}, litcoin_ban = ${lite[1].split(',').join('')} where id_tien_coin = 1`
				)
			}
			else {
			console.log(error);
			}
		});
		//#endregion 

		//#region Tether USDT
		let USDT = {
			url: 'https://remitano.com/usdt/vn',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
			}
		};
		const usdt = []
		request(USDT, async (error, response, html) => {
		// console.log(response.statusCode)
			if(!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			
			$('.amount').each((index, el)=>{
				usdt.push(el.children.map(x=>x.data).toString())

			})
			// console.log(usdt)

				const newTodo = await pool.query(
					`update tien_coin set tether_mua = ${usdt[0].split(',').join('')}, tether_ban = ${usdt[1].split(',').join('')} where id_tien_coin = 1`
				)
			}
			else {
			console.log(error);
			}
		});
		
		//#endregion 
		const dulieu = await (await pool.query(`select * from tien_coin`))

		res.json(dulieu.rows)
	} catch (error) {
		console.log(error)
	}
})

const puppeteer = require('puppeteer');


app.get('/prodDetails' , async(req,res)=>{
	try {


		// (async () => {
		// 	const browser = await puppeteer.launch();
		// 	const page = await browser.newPage();
		// 	await page.goto("https://www.amazon.com/SAMSUNG-Inch-Internal-MZ-77E1T0B-AM/dp/B08QBJ2YMG/");
		  

		// 	const title = await page.emulate(()=>{
		// 		let title = document.getElementById("productTitle").value
		// 		return title
		// 	})
			
		// 	const songs = await page.evaluate(() => {
		// 	  let items = document.querySelectorAll(".name_song");
		// 	  let links = [];
		// 	  items.forEach(item => {
		// 		links.push({
		// 		  title: item.innerText,
		// 		  url: item.getAttribute("href")
		// 		});
		// 	  });
		// 	  return links;
		// 	});
		// 	console.log(songs);

		// 	await browser.close();
		//   })();
		//#region Litecoin
		let LTC = {
			url: 'https://www.amazon.com/AmazonBasics-Kids-Easy-Wash-Microfiber-Bedding',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
			}
		};
		const lite = []
		request(LTC, async (error, response, html) => {
		console.log(response.statusCode)
			if(!error && response.statusCode == 200) {
			    let $ = cheerio.load(html);
			// $('#productDetails_techSpec_section_1 > tbody > tr > td.data').toArray().map(item => {
			// 	console.log(item.text());
			// });
			// console.log(html)
			const title = $('.product-title-word-break').text()
			console.log(title)
			
			fs.writeFile('input.txt', 'ab',  function(err) {
				if (err) {
					return console.error(err);
				}
				console.log("Ghi du lieu vao file thanh cong!");
				console.log("Doc du lieu vua duoc ghi");
				fs.readFile('input.txt', function (err, data) {
				   if (err) {
					  return console.error(err);
				   }
				   console.log("Noi dung file: " + data.toString());
				});
			 });
		
			}
			
			else {
			console.log(error);
			}
		});
		//#endregion 
	} catch (error) {
		console.log(error)
	}
})





app.get('/DSCongNoKhachHang' , async(req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_doi_tuong where kieu = 0
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.get('/DSCongNoNCC' , async(req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_doi_tuong where kieu = 1
		`)

		res.json(newTodo.rows)
	} catch (error) {
		
	}
})



app.get('/DanhSachNhanVien' , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
			select * from tbl_nhan_vien
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})



// Trang QB

app.get(`/v1/DanhSachLoaiHang` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
			select * from tbl_loai_hang
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})





app.post('/HoaDonBanPOS', async (req,res)=>{
	try {
		const {HoVaTen,DiaChi,TinhThanhPho,QuanHuyen,MaBuuChinh,DiaChiEmail,SoDT,NoiDungCanGhiChu,PhuongThucThanhToan,NgayGiaoHangMongMuon,TongTien,doi_tuong_id,GioHang} = req.body
		console.log('Mua hang online')
		const date = new Date()
		var ngay_viet_nam = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`


		console.log(ngay_viet_nam)
		console.log({HoVaTen,DiaChi,TinhThanhPho,QuanHuyen,MaBuuChinh,DiaChiEmail,SoDT,NoiDungCanGhiChu,PhuongThucThanhToan,GioHang,NgayGiaoHangMongMuon,TongTien})

		const dl = await pool.query(`
		select * from tbl_hoa_don_ban,tbl_hoa_don_ban_chi_tiet where 
		date_part('day', tbl_hoa_don_ban.ngay) = ${date.getDate()} 
		and date_part('month', tbl_hoa_don_ban.ngay) = ${date.getMonth()+1} 
		and date_part('year', tbl_hoa_don_ban.ngay) = ${date.getFullYear()}
		and tbl_hoa_don_ban_chi_tiet.trang_thai_so_seri = N'HD'
		and tbl_hoa_don_ban.hoa_don_ban_id = tbl_hoa_don_ban_chi_tiet.hoa_don_ban_id
		`)
		
	
		console.log(dl.rows)
		// // Tạo hoá đơn
		const hoa_don_ban_id = fnc.HoaDonBanID(dl.rows,`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`)
		console.log(hoa_don_ban_id)
		const TaoHoaDon = await pool.query(`
		insert into tbl_hoa_don_ban(hoa_don_ban_id,ngay,doi_tuong_id,ten_doi_tuong,tong_gia_tri,tien_thuc_tra,trang_thai,kieu,nhan_vien_id,nguoi_tao,dl_hoadonban,dl_trangthaihoadon)
		values (N'${hoa_don_ban_id}','${ngay_viet_nam + ' '+ danghoa(date.getHours().toString())}:${danghoa(date.getMinutes().toString())}:${danghoa(date.getSeconds().toString())}',${doi_tuong_id},N'${HoVaTen}',${TongTien},${TongTien},true,1,${1},N'${'Khách hàng'}',N'${JSON.stringify([{HoVaTen,DiaChi,TinhThanhPho,QuanHuyen,MaBuuChinh,DiaChiEmail,SoDT,NoiDungCanGhiChu,PhuongThucThanhToan,GioHang,NgayGiaoHangMongMuon,TongTien}])}',
		N'[${`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`+' '+`${danghoa(date.getHours().toString())}:${danghoa(date.getMinutes().toString())}:${danghoa(date.getSeconds().toString())}`} ] Chờ xác nhận *')
		`)
		
		// 
		// Cập nhập tồn kho
		GioHang.map(async(x)=>{
			const newTodo = await pool.query(`
			update tbl_hang_ton_dau_ky set so_luong_phat_sinh = so_luong_phat_sinh - ${x.so_luong} where hang_id = ${x.hang_id} ;
			insert into tbl_hoa_don_ban_chi_tiet(hoa_don_ban_id,kho_id,doi_tuong_id,hang_id,dvt_id,so_luong,don_gia,trang_thai_so_seri)
			values(N'${hoa_don_ban_id}',1,2,${x.hang_id} ,(select dvt_id from tbl_hang_ton_dau_ky where hang_id = ${x.hang_id}) ,${x.so_luong}, ${x.gia_ban_le}, N'HD')
		`)
		})
		res.json(hoa_don_ban_id)
	} catch (error) {
		console.log(error)
	}
})





const conver_giocong = (giocong)=>{
	return parseFloat(giocong.split(':')[0]) + parseFloat(giocong.split(':')[1]/60)
  }
  


app.get(`/CapNhapGioCongNhanVien` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
			select * from tbl_lich_nhan_vien,tbl_gio_cong
			where tbl_lich_nhan_vien.gio_cong_id = tbl_gio_cong.gio_cong_id
		`)

		// console.log(newTodo.rows)
		newTodo.rows.map(async (x)=>{
			if(x.gio_vao !== null && x.gio_ra !== null){
				console.log(conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra).toString()) - conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao).toString()))
				console.log(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao))
				console.log(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra))
				JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao)
				JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra)
				console.log(

					`update tbl_gio_cong set ngay_cong =N'${conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra).toString()) - conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao).toString())}'
					where gio_cong_id = ${x.gio_cong_id}
					`
				)
				const lich_nhan_vien = await pool.query(
					`update tbl_gio_cong set ngay_cong =N'${conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra).toString()) - conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao).toString())}'
					where gio_cong_id = ${x.gio_cong_id}
					`
				)
				console.log(lich_nhan_vien)
				if(parseFloat(x.gio_vao) <= parseFloat(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao))
					&&  parseFloat(x.gio_ra) >= parseFloat(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra))
				){
					console.log(

						`update tbl_gio_cong set ngay_cong =N'${conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra).toString()) - conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao).toString())}'
						where gio_cong_id = ${x.gio_cong_id}
						`
					)
					const lich_nhan_vien = await pool.query(
						`update tbl_gio_cong set ngay_cong =N'${conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_ra).toString()) - conver_giocong(JSON.parse(x.ca_lam_viec).map(y=>y.gio_vao).toString())}'
						where gio_cong_id = ${x.gio_cong_id}
						`
					)
					console.log(lich_nhan_vien)
				}else{

				}
			}
		})
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.post('/ThemLichNghiNhanVien' , async (req,res)=>{
	try {
		const {ten_nhan_vien,so_buoi_nghi,tu_ngay,den_ngay,tieu_de,noi_dung,link} = req.body
		console.log( {ten_nhan_vien,so_buoi_nghi,tu_ngay,den_ngay,tieu_de,noi_dung})
		const newTodo = await pool.query(`
		
		insert into tbl_don_xin_nghi(
			ten_nhan_vien,so_buoi_nghi,tu_ngay,den_ngay,tieu_de,noi_dung,link
		)
		values(N'${ten_nhan_vien}',${so_buoi_nghi},'${tu_ngay}','${den_ngay}',N'${tieu_de}',N'${noi_dung}',N'${link === ''  ? 'null' : link}')
		`)

		res.json('')
	} catch (error) {
		console.log(error)
	}
})


app.get(`/DanhSachLichNghiNhanVien` , async(req,res)=>{
	try {
		

		const newTodo = await pool.query(`
			select *,
			TO_CHAR(tu_ngay,'DD-MM-YYYY HH24:MI:SS AM')"TuNgay",
			TO_CHAR(den_ngay,'DD-MM-YYYY HH24:MI:SS AM')"DenNgay"
			from tbl_don_xin_nghi
		`)
		res.json(newTodo.rows)
	} catch (error) {
		console.log(error)
	}
})





var randomstring = require("randomstring");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nguyenhuonghpv1@gmail.com',
    pass: 'TUng0936563013*' // naturally, replace both with your real credentials or an application-specific password
  }
});









app.post(`/DangKyTaiKhoanQuaMail`, async (req,res)=>{
	try {
		const {DienThoai,DiaChi,HoVaTen,Email}= req.body
		console.log({DienThoai,DiaChi,HoVaTen,Email})
		const XemDuLieuTaiKhoan = await pool.query(`
		select * from tbl_bang_tai_khoan_khach_hang,tbl_doi_tuong
		where tbl_bang_tai_khoan_khach_hang.tai_khoan_khach = N'${Email}'
		and tbl_doi_tuong.doi_tuong_id = tbl_bang_tai_khoan_khach_hang.doi_tuong_id
		and tbl_doi_tuong.dien_thoai = N'${DienThoai}'
		`)
		var random_password = randomstring.generate(16);
		if(XemDuLieuTaiKhoan.rows.length <=0){
			// console.log({TaiKhoan,TenVaTenDem,DiaChi,Ho,SDT,Email,MatKhau})
			const newTodo = await pool.query(`
				select * from tbl_bang_tai_khoan_khach_hang
				where tai_khoan_khach = N'${Email}'
			`)
			if(newTodo.rows.length > 0){
				res.json({
					status:2,
					data:[],
					message:'Tài khoản đã có trong hệ thống!'
				})
			}else{
				const DoiTuong = await pool.query(`
					select * from tbl_doi_tuong
				`)
				console.log(fnc.MaDT(DoiTuong.rows))
				const newTodo = await pool.query(`
					INSERT INTO tbl_doi_tuong(
						loai_doi_tuong_id,ma_doi_tuong,ten_doi_tuong,dia_chi,dien_thoai
					)
					VALUES(1,'${fnc.MaDT(DoiTuong.rows)}',N'${HoVaTen+' - ' + Email}' , N'${DiaChi}',N'${DienThoai}');
					
				`)
				const taotaikhoan = await pool.query(`
				insert into tbl_bang_tai_khoan_khach_hang(
					tai_khoan_khach,mat_khau_khach,doi_tuong_id,tich_diem,email
				)
				values(
					N'${Email}',N'${random_password}',(SELECT doi_tuong_id from tbl_doi_tuong where ma_doi_tuong = N'${fnc.MaDT(DoiTuong.rows)}'),0,N'${Email}'
				)
				`)
				res.json({
					status:1,
					data:'',
					message: ` Đăng ký tài khoản người dùng ${Email} thành công! `
				})
			}
			const mailOptions = {
			  from: 'nguyenhuonghpv1@gmail.com',
			  to: `${Email}`,
			  subject: `[Trung tâm hỗ trợ][${fnc.thoigianhientai}] Tài khoản mới`,
			  text: `Tài khoản đăng nhập mới Nội thất minh long\n

					Tài khoản : ${Email}\n
					Số điện thoại : ${DienThoai}\n
					Mật khẩu mới : ${random_password}\n
			  `
			};

			transporter.sendMail(mailOptions, function(error, info){
			  if (error) {
				console.log(error);
			  } else {
			    console.log('Email sent: ' + info.response);
			  }
			});

			res.json({
				status:1,
				message:'Tài khoản mật khẩu mới đã gửi về gmail!'
			})
		}else{
			res.json({
				status:0,
				message:'Tài khoản, số điện thoại không có trên hệ thống!'
			})
		}
	} catch (error) {
		console.log(error)
	}
})













const xlsx = require('node-xlsx');


const _xlsx = require('xlsx');




// import xlsx from 'node-xlsx'
// import fs from 'fs'

// var obj = xlsx.parse(__dirname + '/import.xlsx'); // parses a file
function isNumber(val) {
    // negative or positive
    return /^[-]?\d+$/.test(val);
}

// url  -> '/import.xlsx' 
const ConvertExcelToJson = ()=>{
    try {
        var obj = xlsx.parse(fs.readFileSync('./import.xlsx')); // parses a buffer

        console.log(obj)
        const JsonData_Excel = []
        obj.map(x=>
            x.data.map((y,index)=>
            isNumber(y[0])===true ? 
            JsonData_Excel.push({
                STT : y[0],
                ma_hang : y[1],
                ten_hang : y[2],
                nha_cung_cap : y[3],
                so_luong : y[4],
                don_gia : y[5],
                thanh_tien : y[6],
            })
            :''
            ))

        // console.log(JsonData_Excel)
        return JsonData_Excel
    } catch (error) {
        console.log(error)
    }
}
// console.log(ConvertExcelToJson('/import.xlsx'))
const ConvertFileExcelToJson = (file)=>{
    try {
        var obj = xlsx.parse(fs.readFileSync(file)); // parses a buffer

        const JsonData_Excel = []
        obj.map(x=>
            x.data.map((y,index)=>
            isNumber(y[0])===true ? 
            JsonData_Excel.push({
                STT : y[0],
                ma_hang : y[1],
                ten_hang : y[2],
                nha_cung_cap : y[3],
                so_luong : y[4],
                don_gia : y[5],
                thanh_tien : y[6],
            })
            :''
            ))

        // console.log(JsonData_Excel)
        return JsonData_Excel
    } catch (error) {
        
    }
}

const WriteFile = async (file,filename)=>{
    try {
    } catch (error) {
        console.log(error)
    }
}


// export default {
//     WriteFile,ConvertFileExcelToJson,ConvertExcelToJson
// }






app.post('/upload/:ngay_nhap', (req, res) => {

	const {ngay_nhap} = req.params
	console.log(ngay_nhap)
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }


	
    const myFile = req.files.file;
	console.log(myFile)
    //  mv() method places the file inside public directory
    myFile.mv(`./public/[${ngay_nhap.split('-')[2]+'-'+ngay_nhap.split('-')[1]+'-'+ngay_nhap.split('-')[0]}]Nhập hàng-${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "Error occured" });
        }
        // returing the response with file path and name
        return res.send({name: myFile.name, path: `/[${ngay_nhap.split('-')[2]+'-'+ngay_nhap.split('-')[1]+'-'+ngay_nhap.split('-')[0]}]Nhập hàng-${myFile.name}`});
    });
})

const exp = require('./public/ExcelToJson')

const convertFileExcelToJson = (file)=>{
    try {
        
        var obj = xlsx.parse(fs.readFileSync(file)); // parses a buffer
        console.log('tesst')
        console.log(obj)
        const JsonData_Excel = []
        obj.map(x=>
            x.data.map((y,index)=>
            isNumber(y[0])===true ? 
            JsonData_Excel.push({
                STT : y[0],
                ma_hang : y[1],
                ten_hang : y[2],
                nha_cung_cap : y[3],
                so_luong : y[4],
                don_gia : y[5],
                thanh_tien : y[6],
            })
            :''
            ))

        // console.log(JsonData_Excel)
        return JsonData_Excel
    } catch (error) {
        
    }
}

app.get('/ExcelToJson/:ten_phieu_nhap' , (req,res)=>{
	try {
		const {ngay_nhap,ten_phieu_nhap} = req.params
		
		console.log(convertFileExcelToJson(`./public/${ten_phieu_nhap}.xlsx`))

		res.json(convertFileExcelToJson(`./public/${ten_phieu_nhap}.xlsx`))
	} catch (error) {
		
	}
})





app.post('/uploaddonxinnghi/:ngay_nhap', (req, res) => {

	const {ngay_nhap} = req.params
	console.log(ngay_nhap)
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }


	
    const myFile = req.files.file;
	console.log(myFile)
    //  mv() method places the file inside public directory
    myFile.mv(`./public/[${ngay_nhap.split('-')[2]+'-'+ngay_nhap.split('-')[1]+'-'+ngay_nhap.split('-')[0]}]uploaddonxinnghi-${myFile.name}`, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).send({ msg: "Error occured" });
        }
        // returing the response with file path and name
        return res.send({name: myFile.name, path: `/[${ngay_nhap.split('-')[2]+'-'+ngay_nhap.split('-')[1]+'-'+ngay_nhap.split('-')[0]}]uploaddonxinnghi-${myFile.name}`});
    });
})



// app.get('/DSKho' , async(req,res)=>{
// 	try {
		
// 	} catch (error) {
		
// 	}
// })





//  Kho hàng


app.get(`/KhoHang` , async (req,res)=>{
	try {
		const newTodo = await pool.query(`
		select * from tbl_kho
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})

app.post(`/KhoHang` , async (req,res)=>{
	try {
		const {ten_kho,dia_chi,suc_chua,ghi_chu,nguoi_tao,ngay_tao} = req.body

		const khohang = await pool.query(`select * from tbl_kho`)

		const newTodo = await pool.query(`
			insert into tbl_kho(
				ma_kho,ten_kho,ghi_chu,ngay_tao,nguoi_tao,dia_chi,suc_chua
			)
			values(
				N'${fnc.KhoHangID(khohang.rows)}',N'${ten_kho}',N'${ghi_chu}','${ngay_tao}','${nguoi_tao}',
				N'${dia_chi}',N'${suc_chua}'
			)
		`)

		const DuLieuTruyenLen = await pool.query(`
		select * from tbl_kho where ten_kho = N'${ten_kho}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		console.log(error)
	}
})


app.delete(`/KhoHang` , async (req,res)=>{
	try {
		const {ma_kho} = req.body
		const newTodo = await pool.query(`
			delete from tbl_kho where ma_kho = N'${ma_kho}'
		`)
		res.json(newTodo.rows)
	} catch (error) {
		
	}
})


app.put(`/KhoHang` , async (req,res)=>{
	try {
		const {ma_kho,ten_kho,dia_chi,suc_chua,ghi_chu} = req.body
		const newTodo = await pool.query(`
			update tbl_kho
			set ten_kho = N'${ten_kho}',
			dia_chi = N'${dia_chi}',
			suc_chua = N'${suc_chua}',
			ghi_chu = N'${ghi_chu}'
			where ma_kho = N'${ma_kho}'
		`)
		const DuLieuTruyenLen = await pool.query(`
		select * from tbl_kho where ten_kho = N'${ten_kho}'
		`)
		res.json(DuLieuTruyenLen.rows)
	} catch (error) {
		
	}
})



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BLOCK_SETTINGS, BlockRegistry } from './blocks/Index';
import contentApi from '../../../api/contentApi';
import SuccessNoti from '../../comon/Noti/Success';
import ErrorNoti from '../../comon/Noti/Error';
import WarningNoti from '../../comon/Noti/Warning';

const PAGE_CONFIGS = {
  home: {
    mode: 'FLEXIBLE',
    allowedBlocks: ['hero_block', 'intro_block', 'scroll_block', 'spiritual_block', 'nation_block', 'produce_block', 'interaction_block']
  },
  explore: {
    mode: 'FLEXIBLE',
    allowedBlocks: ['exploreHero_block', 'exploreTheme_block', 'exploreStory_block', 'exploreTradition_block', 'exploreGrid_block', 'explorevideo_block', 'exploreColor_block', 'exploreZoomImage_block', 'exploreSlide_block', 'exploreMore_block']
  },
  policy: {
    mode: 'STATIC',
    allowedBlocks: ['policy_block']
  },
  about: {
    mode: 'STATIC',
    allowedBlocks: ['aboutIntro_block', 'aboutVision_block', 'aboutOutro_block']
  },
  contact: {
    mode: 'STATIC',
    allowedBlocks: ['contact_block']
  },
  homeDigital: {
    mode: 'FLEXIBLE',
    allowedBlocks: ['section 1', 'section 2', 'section 3', 'section 4', 'section 5']
  },
  exploreDigital: {
    mode: 'STATIC',
    allowedBlocks: ['exploreDigital_block']
  }
};

export default function CMSEditor({ pageName, title }) {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentConfig = PAGE_CONFIGS[pageName] || { mode: 'STATIC', allowedBlocks: [] };
  const isFlexible = currentConfig.mode === 'FLEXIBLE';
  const [fetchError, setFetchError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [errPopup, setErrPopup] = useState(null);
  const [deleteObject, setDeleteObject] = useState({ id: "", name: "" });
  const [succPopup, setSuccPopup] = useState(null);
  const [warn, setWarn] = useState(null);
  const [path, setPath] = useState(window.location.pathname);
  const [nav, setNav] = useState(null);

  useEffect(() => {
    if (path === '/admin/cms/exploreDigital' || path === '/admin/cms/homeDigital') {
      setNav('digital');
    } else {
      setNav('classic');
    }
    fetchBlocks();
  }, [pageName]);

  const fetchBlocks = async (isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await contentApi.get(pageName);
      const fetchedData = response.data.data || [];
      if (isFlexible) {
        setBlocks(fetchedData);
      } else {
        const staticBlocks = currentConfig.allowedBlocks.map((expectedType, index) => {
          const existingBlock = fetchedData.find(b => b.block_type === expectedType);
          if (existingBlock) {
            return existingBlock;
          } else {
            return {
              id: 'new_' + expectedType + '_' + Date.now(),
              isNew: true,
              block_type: expectedType,
              content: {},
              display_order: index + 1
            };
          }
        });

        setBlocks(staticBlocks);
      }

      setFetchError(null);
      setRetryCount(0);
    } catch (error) {
      if (retryCount >= 2) {
        setFetchError("Có vẻ như đã xảy ra lỗi server, hãy thử tải lại trang và kiểm tra lại dữ liệu!");
      } else {
        setFetchError("Có lỗi xảy ra, hãy thử lại!");
      }
    } finally {
      setIsRetrying(false);
      setIsLoading(false);
    }
  };

  const handleAddBlock = (blockType) => {
    const newBlock = {
      id: 'new_' + Date.now(),
      isNew: true,
      block_type: blockType,
      content: {},
      display_order: blocks.length + 1
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleDelete = (id, block_type) => {
    if (id.toString().startsWith('new_')) {
      setBlocks(blocks.filter(b => b.id !== id));
    } else {
      setDeleteObject({ id: id, name: block_type });
      setDeleted(true);
    }
  };

  const ConfirmDelete = async () => {
    setSuccPopup(null);
    setErrPopup(null);
    try {
      await contentApi.delete(deleteObject.id);
      setSuccPopup('Xoá thành công.');
      setTimeout(() => {
        setDeleted(false);
        setSuccPopup(null);
        fetchBlocks();
      }, 2000)
    } catch (error) {
      setErrPopup('Lỗi xoá khối!');
      return;
    }
  };

  const moveBlock = async (index, direction) => {
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
    if (newBlocks[index].isNew || newBlocks[swapIndex].isNew) return;
    const orderedIds = newBlocks.filter(b => !b.isNew).map(b => b.id);
    setWarn(null);
    try {
      await contentApi.order(pageName, orderedIds);
    } catch (error) {
      setWarn("Lỗi lưu thứ tự!");
      setTimeout(() => {
        setWarn(null);
      }, 2000)
      fetchBlocks();
    }
  };

  const changeNav = () => {
    setNav(prev => (prev === "classic" ? "digital" : "classic"));
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang kết nối...</div>;

  return (
    <div className="overflow-y-auto h-screen mt-4 space-y-6 max-w-[96%] mx-auto">
      {nav == "classic" &&
        <div className='max-w-[96%] rounded shadow-md p-2 mx-auto h-14 flex justify-between items-center bg-[#0F3A32] transform-all duration-300 ease-out'>
          <Link to="/admin/cms/homeClassic" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Home</Link>
          <Link to="/admin/cms/exploreClassic" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Explore</Link>
          <Link to="/admin/cms/policy" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Policy</Link>
          <Link to="/admin/cms/about" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>About</Link>
          <Link to="/admin/cms/contact" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Contact</Link>
          <button onClick={changeNav} className='lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 8L7 4m0 0L3 8m4-4v16m6-4l4 4m0 0l4-4m-4 4V4" /></svg></button>
        </div>
      }
      {nav == "digital" &&
        <div className='max-w-[96%] rounded shadow-md p-2 mx-auto h-14 flex justify-between items-center bg-[#191B1D] transform-all duration-300 ease-out'>
          <Link to="/admin/cms/homeDigital" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Home</Link>
          <Link to="/admin/cms/exploreDigital" className='text-white lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'>Explore</Link>
          <div className='invisible p-2'>Policy</div>
          <div className='invisible p-2'>About</div>
          <div className='invisible p-2'>Contact</div>
          <button onClick={changeNav} className='lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 8L7 4m0 0L3 8m4-4v16m6-4l4 4m0 0l4-4m-4 4V4" /></svg></button>
        </div>
      }
      <div>
        <div className="text-xl font-bold text-gray-800">Cấu trúc trang: <span className="text-blue-600 uppercase">{title}</span></div>
        <div className="text-sm text-gray-500 mt-1">
          {isFlexible ? 'Bạn có thể thêm, xóa và thay đổi vị trí các khối.' : 'Trang cố định: Chỉ được sửa nội dung văn bản.'}
        </div>
      </div>

      <div className="space-y-6">
        {blocks.length === 0 && <p className="text-center text-gray-400 py-4">Chưa có nội dung nào.</p>}

        {blocks.map((block, index) => {
          const AdminFormComponent = BlockRegistry[block.block_type];
          if (!AdminFormComponent) return null;
          const isFirst = index === 0;
          const isLast = index === blocks.length - 1;
          const blockSettings = BLOCK_SETTINGS[block.block_type] || {};
          return (
            <div key={block.id} className="flex border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              {isFlexible && (
                <div className="w-12 bg-gray-200 border-r border-gray-300 flex flex-col justify-center items-center py-2 gap-3">
                  {!isFirst && (
                    <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-white rounded" title="Lên">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 80 80"><g fill="none"><path fill="currentColor" d="M36.964 17.7a3 3 0 1 1 6 .004zm3 .078l3 .002zm0 .889l-3-.003zm0 .888l3 .002zm-.001.89l3 .001zm-.001.888l-3-.002zm0 .889h-3v-.002zm3 20.074a3 3 0 0 1-6 0zm-6 .037a3 3 0 0 1 6 0zm6 21.667a3 3 0 0 1-6 0zm.002-46.296v.075l-6-.003V17.7zm0 .075v.89l-6-.005v-.888zm0 .89v.888l-6-.004v-.889zm0 .888l-.001.89l-6-.005v-.889zm-.001.89l-.001.888l-6-.004v-.889zm-.001.888v.889l-6-.004v-.889zm0 .887v20.074h-6V22.222zm0 20.111V64h-6V42.333z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="m15.11 39.11l21.177-21.176a5.25 5.25 0 0 1 7.425 0l21.176 21.177" /></g></svg>
                    </button>
                  )}
                  <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                  {!isLast && (
                    <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-white rounded" title="Xuống">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"><path strokeMiterlimit="10" d="M12 20V4" /><path strokeLinejoin="round" d="m4.34 12.968l6.572 6.572a1.53 1.53 0 0 0 2.176 0l6.573-6.572" /></g></svg>
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 p-5">
                {isFlexible && (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      Khối: {block.block_type}
                    </span>
                    <button onClick={() => handleDelete(block.id, block.block_type)} className="admin-confirm-button bg-red-600">
                      Xóa
                    </button>
                  </div>
                )}
                <div className='lg:pb-4 pb-2' >
                  {warn && <WarningNoti warn={warn} />}
                </div>
                <AdminFormComponent
                  blockData={block}
                  pageName={pageName}
                  onSaveSuccess={fetchBlocks}
                  {...blockSettings}
                />
              </div>
            </div>
          );
        })}
      </div>
      {isFlexible && (
        <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center bg-white">
          <div className="text-gray-500 font-medium mb-3">Thêm khối nội dung mới:</div>
          <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
            {currentConfig.allowedBlocks.map(type => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className="bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 px-4 py-2 rounded transition-colors font-medium shadow-sm"
              >
                + Thêm {type}
              </button>
            ))}
          </div>
        </div>
      )}
      {fetchError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm absolute inset-0" />
          <div className="bg-[#f5f5f3] flex flex-col justify-between rounded-md space-y-4 p-6 relative z-10 w-[70vw] lg:w-[40vw]">
            <div className='flex justify-end items-center'>
              <button onClick={() => setFetchError(null)} className="hover:bg-gray-400 py-2 px-3 rounded-md font-bold">✕</button>
            </div>
            <ErrorNoti err={"Mất đồng bộ dữ liệu!"} />
            <div className="font-inter text-gray-600 mb-6 text-xs text-center">{fetchError}</div>
            <div className='flex justify-center items-center'>
              <button onClick={() => fetchBlocks(true)} disabled={isRetrying} className="admin-confirm-button w-40 text-center">
                {isRetrying ? 'Đang kết nối...' : 'Thử lại'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm absolute inset-0" />
          <div className=" bg-[#f5f5f3] flex flex-col justify-between rounded-md space-y-4 p-6 relative z-10 w-[70vw] lg:w-[20vw]">
            <div className="flex-1">
              <div className="heading-body">Có chắc muốn xoá?</div>
              <div className="heading-body font-bold">{deleteObject.name}</div>
            </div>
            <div className="flex gap-2 items-end justify-around w-full">
              <div className="">
                <button type="button" className="admin-confirm-button px-6 bg-red-600" onClick={() => ConfirmDelete()}>Có</button>
              </div>
              <div className="">
                <button type="button" className="admin-confirm-button" onClick={() => { setDeleted(false); setDeleteObject({ id: "", name: "" }) }}>Không</button>
              </div>
            </div>
            <div className="w-full text">
              {errPopup && (
                <ErrorNoti err={errPopup} />
              )}
              {succPopup && (
                <SuccessNoti succ={succPopup} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}